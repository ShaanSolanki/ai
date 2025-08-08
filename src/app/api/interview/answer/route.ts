// src/app/api/interview/answer/route.ts
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import InterviewSession from "@/models/interviewsession";
import type { Types } from "mongoose";

interface AnswerRequestBody {
  sessionId: string;
  questionId: string;
  answerText: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnswerRequestBody = await req.json();
    const { sessionId, questionId, answerText } = body;

    if (!sessionId || !questionId || !answerText) {
      return NextResponse.json(
        { error: "sessionId, questionId and answerText are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // For now, skip userId filtering
    const session = await InterviewSession.findOne({ _id: sessionId });

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    const question = session.questions.id(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    question.answerText = answerText;

    const currentIndex = session.questions.findIndex((q: any) => {
      if (typeof q._id === "object" && "equals" in q._id) {
        return q._id.equals(question._id as Types.ObjectId);
      }
      return q._id.toString() === question._id.toString();
    });

    if (session.currentQuestionIndex === currentIndex) {
      if (currentIndex < session.questions.length - 1) {
        session.currentQuestionIndex++;
      } else {
        session.currentQuestionIndex = session.questions.length;
      }
    }

    await session.save();

    const completed = session.currentQuestionIndex >= session.questions.length;
    const nextQuestion = !completed
      ? {
          _id: session.questions[session.currentQuestionIndex]._id.toString(),
          questionText: session.questions[session.currentQuestionIndex].questionText,
        }
      : null;

    return NextResponse.json(
      {
        message: "Answer saved",
        nextQuestion,
        completed,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
