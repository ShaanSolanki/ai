import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/interviewsession";
import User from "@/models/user";
import mongoose from "mongoose";

// DON'T expose your API key in public code! For demo only:
const GEMINI_API_KEY = "AIzaSyBEX6AXREH3YoelhWEA2oB4dKycuM_ykIs";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

interface Question {
  questionText: string;
  answerText?: string;
  feedback?: string;
  difficulty?: string;
}

const DIFFICULTY_LABELS: { [key: string]: string } = {
  easy: "entry-level (easy)",
  intermediate: "mid-level (intermediate)",
  advanced: "senior-level (advanced)",
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const reqBody = await req.json();
    const topic: string = reqBody.topic;
    let numberOfQuestions: number = reqBody.numberOfQuestions ?? 5;
    const difficulty: string = reqBody.difficulty?.toLowerCase() ?? "intermediate";
    const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? "mid-level (intermediate)";

    if (!topic) {
      return NextResponse.json({ message: "Topic is required" }, { status: 400 });
    }

    // Clamp numberOfQuestions between 1 and 20 (adjust max as needed)
    numberOfQuestions = Math.min(Math.max(numberOfQuestions, 1), 20);

    // Identify user dynamically based on email
    const email: string | undefined = reqBody.email;
    const name: string | undefined = reqBody.name ?? "AutoCreatedUser";
    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      // Generate fallback email if not provided
      const generatedEmail = email
        ? email.toLowerCase().trim()
        : `user${Math.floor(Math.random() * 1_000_000)}@example.com`;

      user = await User.create({
        name,
        email: generatedEmail,
        password: "temporarypassword",
        sessions: [],
      });
    }

    const userId = user._id;
    const questions: Question[] = [];

    const basePrompt = `Generate a concise, clear, professional interview question on the topic "${topic}" at the ${difficultyLabel} of difficulty. The question must reflect real technical interview questions used by industry professionals. Limit to 20 words maximum.`;

    for (let i = 0; i < numberOfQuestions; i++) {
      const fetchRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: basePrompt }],
            },
          ],
        }),
      });

      const data = await fetchRes.json();

      if (
        !data ||
        !data.candidates ||
        !Array.isArray(data.candidates) ||
        data.candidates.length === 0
      ) {
        console.error("Gemini API response missing candidates:", data);
        return NextResponse.json({ message: "Failed to generate question (no candidates)" }, { status: 500 });
      }

      const candidate = data.candidates[0];

      if (
        !candidate.content ||
        !candidate.content.parts ||
        !Array.isArray(candidate.content.parts) ||
        candidate.content.parts.length === 0
      ) {
        console.error("Gemini API candidate missing content parts:", candidate);
        return NextResponse.json({ message: "Failed to generate question (no content parts)" }, { status: 500 });
      }

      const text = candidate.content.parts[0].text;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        console.error("Gemini API returned empty question text");
        return NextResponse.json({ message: "Failed to generate question (empty text)" }, { status: 500 });
      }

      questions.push({
        questionText: text.trim(),
        difficulty,        // add difficulty for traceability
        // answerText: "",
        // feedback: "",
      });
    }

    if (questions.length === 0) {
      return NextResponse.json({ message: "No questions generated" }, { status: 500 });
    }

    // Create the interview session with progress tracking and empty answers array
    const session = await InterviewSession.create({
      userId,
      questions,
      currentQuestionIndex: 0,
      answers: [],
    });

    // Update user's sessions array to reference this session (optional)
    await User.findByIdAndUpdate(userId, { $push: { sessions: session._id } });

    // Fetch the session again so that questions have MongoDB-generated _id fields
    const savedSession = await InterviewSession.findById(session._id);
    if (!savedSession) {
      return NextResponse.json({ message: "Failed to create session" }, { status: 500 });
    }

    // Return the full first question object, including _id, questionText, difficulty, etc.
    return NextResponse.json(
      {
        sessionId: savedSession._id,
        question: savedSession.questions[0],
        totalQuestions: savedSession.questions.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error generating questions:", err);
    return NextResponse.json(
      {
        message: "Server Error",
        error: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
