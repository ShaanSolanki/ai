// routes/api/interview/question.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/interviewsession";
import User from "@/models/user";

const GEMINI_API_KEY = "AIzaSyBEX6AXREH3YoelhWEA2oB4dKycuM_ykIs"; // Do NOT commit real keys
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

const DIFFICULTY_LABELS: { [key: string]: string } = {
  easy: "entry-level (easy)",
  intermediate: "mid-level (intermediate)",
  advanced: "senior-level (advanced)",
};

interface Question {
  questionText: string;
  difficulty?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { topic, numberOfQuestions = 5, difficulty = "intermediate", email, name } = await req.json();

    if (!topic) {
      return NextResponse.json({ message: "Topic is required" }, { status: 400 });
    }

    const difficultyLabel = DIFFICULTY_LABELS[difficulty.toLowerCase()] ?? DIFFICULTY_LABELS["intermediate"];
    const clampedNum = Math.min(Math.max(numberOfQuestions, 1), 20);

    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      // fallback user creation
      const genEmail = email ? email.toLowerCase().trim() : `user${Math.floor(Math.random() * 1_000_000)}@example.com`;
      user = await User.create({
        name: name || "AutoCreatedUser",
        email: genEmail,
        password: "temporarypassword",
        sessions: [],
      });
    }

    const questions: Question[] = [];

    const basePrompt = `Generate a concise, clear, professional interview question on the topic "${topic}" at the ${difficultyLabel} difficulty level. Limit to 20 words max.`;

    for (let i = 0; i < clampedNum; i++) {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: basePrompt }] }],
        }),
      });

      const data = await res.json();

      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Invalid Gemini API response:", data);
        return NextResponse.json({ message: "Failed to generate question" }, { status: 500 });
      }

      questions.push({
        questionText: data.candidates[0].content.parts[0].text.trim(),
        difficulty,
      });
    }

    if (questions.length === 0) {
      return NextResponse.json({ message: "No questions generated" }, { status: 500 });
    }

    // Create session with questions and initial progress
    const session = await InterviewSession.create({
      userId: user._id,
      questions,
      currentQuestionIndex: 0,
      answers: [],
    });

    // Link session to user
    user.sessions.push(session._id);
    await user.save();

    // Return first question and session info
    return NextResponse.json({
      sessionId: session._id,
      question: session.questions[0],
      totalQuestions: session.questions.length,
    });
  } catch (err: any) {
    console.error("Error in question generation:", err);
    return NextResponse.json({ message: "Server Error", error: err.message }, { status: 500 });
  }
}
