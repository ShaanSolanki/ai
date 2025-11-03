import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/interviewsession";
import User from "@/models/user";

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

    const questions: Question[] = [];
    const typePrompt = QUESTION_TYPE_PROMPTS[questionType] || QUESTION_TYPE_PROMPTS["Mixed"];

    // Enhanced creative prompts
    const creativeElements = [
      "real-world scenarios",
      "practical applications",
      "problem-solving situations",
      "industry-specific challenges",
      "innovative approaches",
      "current trends and best practices"
    ];

    const creativityBoost = creative ?
      `Make the questions unique, engaging, and incorporate ${creativeElements[Math.floor(Math.random() * creativeElements.length)]}. ` :
      "";

    for (let i = 0; i < clampedNum; i++) {
      // Add variety to questions by using different prompt variations
      const promptVariations = [
        `${creativityBoost}Generate a ${difficultyLabel} interview question about ${topic}. ${typePrompt}. Keep it concise and professional.`,
        `${creativityBoost}Create an insightful ${difficultyLabel} question related to ${topic} that tests practical knowledge. ${typePrompt}.`,
        `${creativityBoost}Design a ${difficultyLabel} interview question for ${topic} that reveals candidate expertise. ${typePrompt}.`,
        `${creativityBoost}Formulate a ${difficultyLabel} question about ${topic} that encourages detailed responses. ${typePrompt}.`
      ];

      const selectedPrompt = promptVariations[i % promptVariations.length];

      try {
        const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: selectedPrompt }] }],
            generationConfig: {
              temperature: creative ? 0.8 : 0.6, // Higher temperature for more creativity
              maxOutputTokens: 100,
              topP: 0.9,
              topK: 40
            }
          }),
        });

        const data = await res.json();

        if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error("Invalid Gemini API response:", data);
          // Fallback question
          questions.push({
            questionText: `Tell me about your experience with ${topic} and how you've applied it in ${difficultyLabel} projects.`,
            difficulty,
            type: questionType
          });
          continue;
        }

        let questionText = data.candidates[0].content.parts[0].text.trim();

        // Clean up the question text
        questionText = questionText.replace(/^(Question:|Q:|\d+\.)\s*/i, '');
        questionText = questionText.replace(/\n.*$/s, ''); // Remove any additional content after newline

        questions.push({
          questionText,
          difficulty,
          type: questionType
        });

        // Add a small delay to avoid rate limiting
        if (i < clampedNum - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("Error generating question:", error);
        // Fallback question
        questions.push({
          questionText: `Describe your approach to working with ${topic} in a ${difficultyLabel} environment.`,
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
