// src/app/api/interview/answer/route.ts
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import InterviewSession from "@/models/interviewsession";
import type { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBEX6AXREH3YoelhWEA2oB4dKycuM_ykIs";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

interface AnswerRequestBody {
  sessionId: string;
  questionId: string;
  answerText: string;
}

// Generate feedback for individual question
async function generateQuestionFeedback(question: any, topic: string) {
  try {
    const feedbackPrompt = `
Evaluate this interview answer for a ${topic} position:

Question: ${question.questionText}
Answer: ${question.answerText}

Please provide feedback in the following JSON format:
{
  "score": [0-100],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "explanation": "detailed explanation of the answer quality",
  "correct": true/false
}

Focus on technical accuracy, clarity, completeness, and relevance to the question.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: feedbackPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (feedbackText) {
        try {
          // Try to parse as JSON first
          const feedbackJson = JSON.parse(feedbackText.replace(/```json\n?|\n?```/g, ''));
          question.feedback = {
            text: feedbackText,
            confidence: feedbackJson.score / 100,
            correct: feedbackJson.correct,
            accuracy: feedbackJson.score,
            explanation: feedbackJson.explanation,
            strengths: feedbackJson.strengths,
            improvements: feedbackJson.improvements
          };
        } catch (parseError) {
          // If JSON parsing fails, use text as is
          question.feedback = {
            text: feedbackText,
            confidence: 0.7,
            correct: true,
            accuracy: 70,
            explanation: feedbackText
          };
        }
      }
    }
  } catch (error) {
    console.error("Error generating question feedback:", error);
    // Set default feedback if generation fails
    question.feedback = {
      text: "Answer received and recorded.",
      confidence: 0.5,
      correct: true,
      accuracy: 50,
      explanation: "Feedback generation temporarily unavailable."
    };
  }
}

// Generate overall session feedback
async function generateSessionFeedback(session: any) {
  try {
    const questions = session.questions;
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter((q: any) => q.answerText?.trim()).length;
    const averageScore = questions.reduce((sum: number, q: any) => sum + (q.feedback?.accuracy || 0), 0) / totalQuestions;

    const feedbackPrompt = `
Generate an overall interview performance summary:

Topic: ${session.topic || 'General'}
Difficulty: ${session.difficulty || 'Intermediate'}
Total Questions: ${totalQuestions}
Answered Questions: ${answeredQuestions}
Average Score: ${averageScore.toFixed(1)}%

Individual Question Performance:
${questions.map((q: any, i: number) => `
Q${i + 1}: ${q.questionText.substring(0, 100)}...
Answer Quality: ${q.feedback?.accuracy || 0}%
`).join('')}

Provide a comprehensive performance summary including:
1. Overall performance rating
2. Key strengths demonstrated
3. Areas for improvement
4. Specific recommendations
5. Interview readiness assessment
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: feedbackPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (feedbackText) {
        session.sessionFeedback = {
          text: feedbackText,
          confidence: averageScore / 100,
          correct: averageScore >= 70,
          accuracy: averageScore,
          explanation: "Overall interview performance analysis"
        };
      }
    }
  } catch (error) {
    console.error("Error generating session feedback:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body: AnswerRequestBody = await req.json();
    const { sessionId, questionId, answerText } = body;



    if (!sessionId || !questionId || !answerText) {
      return NextResponse.json(
        { error: "sessionId, questionId and answerText are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find session belonging to the authenticated user
    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: decoded.userId
    });

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    // Use current question index instead of trying to match IDs
    const questionIndex = session.currentQuestionIndex;

    if (questionIndex >= session.questions.length) {
      return NextResponse.json({ error: "No more questions available" }, { status: 400 });
    }

    const question = session.questions[questionIndex];

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Save the answer to the question
    question.answerText = answerText;

    // Generate feedback for this question
    await generateQuestionFeedback(question, session.topic || 'General');

    // Move to the next question
    if (questionIndex < session.questions.length - 1) {
      session.currentQuestionIndex++;
    } else {
      session.currentQuestionIndex = session.questions.length;
      session.completed = true;
    }

    await session.save();

    const completed = session.currentQuestionIndex >= session.questions.length;
    const nextQuestion = !completed
      ? {
        _id: session.questions[session.currentQuestionIndex]._id.toString(),
        questionText: session.questions[session.currentQuestionIndex].questionText,
        difficulty: session.questions[session.currentQuestionIndex].difficulty,
        type: session.questions[session.currentQuestionIndex].type
      }
      : null;

    // If completed, generate overall session feedback
    if (completed) {
      await generateSessionFeedback(session);
    }

    return NextResponse.json(
      {
        message: "Answer saved",
        nextQuestion,
        completed,
        feedback: question.feedback
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
