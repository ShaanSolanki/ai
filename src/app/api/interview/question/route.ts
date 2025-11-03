import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/interviewsession";
import User from "@/models/user";
import QuestionHistory from "@/models/questionhistory";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBEX6AXREH3YoelhWEA2oB4dKycuM_ykIs";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const DIFFICULTY_LABELS: { [key: string]: string } = {
  easy: "entry-level (easy)",
  intermediate: "mid-level (intermediate)",
  advanced: "senior-level (advanced)",
};

const QUESTION_TYPE_PROMPTS: { [key: string]: string } = {
  Technical: "Focus on technical skills, coding problems, system design, or technical concepts",
  Behavioral: "Focus on soft skills, past experiences, teamwork, leadership, and situational scenarios",
  Mixed: "Include both technical and behavioral aspects"
};

interface Question {
  questionText: string;
  difficulty?: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      topic,
      numberOfQuestions = 5,
      difficulty = "intermediate",
      questionType = "Mixed",
      creative = false,
      email,
      name
    } = await req.json();

    if (!topic) {
      return NextResponse.json({ message: "Topic is required" }, { status: 400 });
    }

    const difficultyLabel = DIFFICULTY_LABELS[difficulty.toLowerCase()] ?? DIFFICULTY_LABELS["intermediate"];
    const clampedNum = Math.min(Math.max(numberOfQuestions, 1), 20);

    // Require authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Get user from token
    let user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get user's recent question history for this topic to avoid repetition
    const recentQuestions = await QuestionHistory.find({
      userId: decoded.userId,
      topic: topic
    })
      .sort({ createdAt: -1 })
      .limit(20) // Last 20 questions for this topic
      .lean();

    const usedQuestionKeys = new Set(recentQuestions.map(q => q.questionKey));

    const questions: Question[] = [];
    const typePrompt = QUESTION_TYPE_PROMPTS[questionType] || QUESTION_TYPE_PROMPTS["Mixed"];
    const generatedQuestions = new Set<string>(); // Track generated questions to prevent duplicates

    // Enhanced creative elements for variety
    const creativeElements = [
      "real-world scenarios and practical examples",
      "problem-solving and troubleshooting situations",
      "design patterns and architectural decisions",
      "performance optimization and best practices",
      "team collaboration and code review processes",
      "debugging and error handling strategies",
      "scalability and maintainability considerations",
      "security and data protection aspects",
      "testing strategies and quality assurance",
      "project management and delivery challenges"
    ];

    // Different question angles for variety
    const questionAngles = [
      "experience-based",
      "scenario-based",
      "problem-solving",
      "conceptual understanding",
      "practical application",
      "comparative analysis",
      "best practices",
      "troubleshooting"
    ];

    for (let i = 0; i < clampedNum; i++) {
      const selectedElement = creativeElements[i % creativeElements.length];
      const selectedAngle = questionAngles[i % questionAngles.length];

      // Create direct, specific prompts that result in actual questions
      const promptVariations = [
        `You are conducting a ${topic} interview. Ask a ${selectedAngle} question about ${selectedElement}. ${typePrompt}. Write only the question, nothing else.`,
        `As an interviewer for a ${topic} position, what would you ask about ${selectedElement} using a ${selectedAngle} approach? ${typePrompt}. Respond with just the question.`,
        `Interview question for ${topic}: Focus on ${selectedElement} with ${selectedAngle} perspective. ${typePrompt}. Output only the question.`,
        `${topic} interview: Ask about ${selectedElement} using ${selectedAngle} method. ${typePrompt}. Question only, no explanation.`
      ];

      const selectedPrompt = promptVariations[i % promptVariations.length];

      // Add context to prevent repetition with clearer instructions
      const contextPrompt = generatedQuestions.size > 0 ?
        `\n\nAvoid these topics already covered: ${Array.from(generatedQuestions).slice(-2).join('; ')}. Make your question different.` :
        "";

      const fullPrompt = selectedPrompt + contextPrompt + "\n\nQuestion:";

      try {
        const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.9, // High temperature for maximum creativity and uniqueness
              maxOutputTokens: 150,
              topP: 0.95,
              topK: 50
            }
          }),
        });

        const data = await res.json();

        if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error("Invalid Gemini API response:", data);
          // Fallback question
          const fallbackQuestions = [
            `What's your experience working with ${topic} in production environments?`,
            `How would you approach debugging a complex ${topic} issue?`,
            `Describe a time when you had to optimize ${topic} performance.`,
            `What are the key considerations when implementing ${topic} in a team project?`
          ];
          const fallbackText = fallbackQuestions[i % fallbackQuestions.length];
          questions.push({
            questionText: fallbackText,
            difficulty,
            type: questionType
          });
          continue;
        }

        let questionText = data.candidates[0].content.parts[0].text.trim();

        // Clean up the question text more aggressively
        questionText = questionText.replace(/^(Question:|Q:|\d+\.|\*\*Question:\*\*|\*\*Q:\*\*)\s*/i, '');
        questionText = questionText.replace(/^(Here's|Here is|I'll ask|I would ask|Let me ask|The question is).*?:/i, '');
        questionText = questionText.replace(/^(Generate|Create|Design|Formulate).*?:/i, '');
        questionText = questionText.replace(/\n.*$/s, ''); // Remove any additional content after newline
        questionText = questionText.replace(/\?+$/, '?'); // Normalize question marks
        questionText = questionText.replace(/^["']|["']$/g, ''); // Remove quotes
        questionText = questionText.trim();

        // Validate it's actually a question and not meta-text
        const lowerText = questionText.toLowerCase();
        const isMetaText = lowerText.includes('i will') || lowerText.includes('i would') ||
          lowerText.includes('here is') || lowerText.includes('here\'s') ||
          lowerText.includes('let me') || lowerText.includes('i\'ll ask') ||
          lowerText.includes('the question') || lowerText.includes('generate') ||
          lowerText.includes('create') || lowerText.includes('design');

        if (isMetaText || questionText.length < 10 || questionText.length > 200) {
          // Use a direct fallback question instead
          const directQuestions = [
            `What's your experience with ${topic}?`,
            `How do you approach ${topic} challenges?`,
            `Describe your ${topic} development process.`,
            `What ${topic} best practices do you follow?`
          ];
          questionText = directQuestions[i % directQuestions.length];
        }

        // Ensure it ends properly
        if (!questionText.includes('?') && !questionText.toLowerCase().startsWith('what') &&
          !questionText.toLowerCase().startsWith('how') && !questionText.toLowerCase().startsWith('why') &&
          !questionText.toLowerCase().startsWith('when') && !questionText.toLowerCase().startsWith('where') &&
          !questionText.toLowerCase().startsWith('describe') && !questionText.toLowerCase().startsWith('explain') &&
          !questionText.toLowerCase().startsWith('tell me')) {
          questionText += '?';
        }

        // Check for duplicates or very similar questions
        const questionKey = questionText.toLowerCase().replace(/[^\w\s]/g, '').trim();
        if (!generatedQuestions.has(questionKey) && !usedQuestionKeys.has(questionKey)) {
          generatedQuestions.add(questionKey);
          questions.push({
            questionText,
            difficulty,
            type: questionType
          });
        } else {
          // If duplicate, try again with a different approach
          if (i < clampedNum + 5) { // Allow a few extra attempts
            i--; // Retry this iteration
            continue;
          } else {
            // If we've tried too many times, use a curated fallback question
            const fallbackQuestions = [
              `What's your experience working with ${topic} in production environments?`,
              `How would you approach debugging a complex ${topic} issue?`,
              `Describe a time when you had to optimize ${topic} performance.`,
              `What are the key considerations when implementing ${topic} in a team project?`,
              `How do you handle error scenarios when working with ${topic}?`,
              `What's your process for testing ${topic} implementations?`,
              `Describe the most challenging ${topic} project you've worked on.`,
              `How do you ensure code quality when developing with ${topic}?`
            ];
            const fallbackText = fallbackQuestions[questions.length % fallbackQuestions.length];
            const fallbackKey = fallbackText.toLowerCase().replace(/[^\w\s]/g, '').trim();

            if (!generatedQuestions.has(fallbackKey) && !usedQuestionKeys.has(fallbackKey)) {
              generatedQuestions.add(fallbackKey);
              questions.push({
                questionText: fallbackText,
                difficulty,
                type: questionType
              });
            }
          }
        }

        // Add a small delay to avoid rate limiting
        if (i < clampedNum - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("Error generating question:", error);
        // Fallback question
        const errorFallbacks = [
          `What's your experience with ${topic} development?`,
          `How do you approach ${topic} problem-solving?`,
          `Describe your ${topic} workflow and best practices.`,
          `What challenges have you faced with ${topic}?`
        ];
        questions.push({
          questionText: errorFallbacks[i % errorFallbacks.length],
          difficulty,
          type: questionType
        });
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({ message: "No questions generated" }, { status: 500 });
    }

    // Create session with enhanced metadata
    const session = await InterviewSession.create({
      userId: user._id,
      topic,
      difficulty,
      questionType,
      totalQuestions: questions.length,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      createdAt: new Date(),
      completed: false
    });

    // Link session to user
    if (!user.sessions) {
      user.sessions = [];
    }
    user.sessions.push(session._id);
    await user.save();

    // Save questions to user's history to prevent future repetition
    const questionHistoryEntries = questions.map(q => ({
      userId: user._id,
      topic: topic,
      questionText: q.questionText,
      questionKey: q.questionText.toLowerCase().replace(/[^\w\s]/g, '').trim(),
      sessionId: session._id
    }));

    try {
      await QuestionHistory.insertMany(questionHistoryEntries);
    } catch (error) {
      console.error("Failed to save question history:", error);
      // Continue anyway, this is not critical
    }

    // Reload the session to get the actual question IDs from the database
    const savedSession = await InterviewSession.findById(session._id);
    if (!savedSession) {
      return NextResponse.json({ message: "Failed to create session" }, { status: 500 });
    }

    // Get the first question with its actual database ID
    const firstQuestion = {
      _id: savedSession.questions[0]._id.toString(),
      questionText: savedSession.questions[0].questionText,
      difficulty: savedSession.questions[0].difficulty,
      type: savedSession.questions[0].type
    };



    return NextResponse.json({
      sessionId: session._id,
      question: firstQuestion,
      totalQuestions: session.questions.length,
      message: "Session created successfully"
    });
  } catch (err: any) {
    console.error("Error in question generation:", err);
    return NextResponse.json({
      message: "Server Error",
      error: err.message
    }, { status: 500 });
  }
}
