import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import InterviewSession from "@/models/interviewsession";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, questionId, answerText } = await req.json();

    if (!sessionId || !questionId || !answerText) {
      return NextResponse.json(
        { error: "sessionId, questionId and answerText are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const session = await InterviewSession.findOne({ _id: sessionId, userId });

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    // Find question by questionId within this session
    const question = session.questions.id(questionId);

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Update the answerText field on the question
    question.answerText = answerText;

    // Find the index of the current question in the questions array
    const currentIndex = session.questions.findIndex((q: any) => q._id.equals(question._id));

    // Move currentQuestionIndex forward only if correct question answered
    if (session.currentQuestionIndex === currentIndex) {
      if (currentIndex < session.questions.length - 1) {
        session.currentQuestionIndex = currentIndex + 1;
      } else {
        // All questions answered, move index beyond last to mark completion
        session.currentQuestionIndex = session.questions.length;
      }
    }

    await session.save();

    const completed = session.currentQuestionIndex >= session.questions.length;

    const nextQuestion = !completed
      ? {
          _id: session.questions[session.currentQuestionIndex]._id,
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
  } catch (error) {
    console.error("POST /api/interview/answer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
