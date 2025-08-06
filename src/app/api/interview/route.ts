import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import InterviewSession from "@/models/interviewsession";
import { verifyToken } from "@/lib/auth";

// POST: Create a new interview session (only if authenticated)
export async function POST(req: NextRequest) {
  try {
    const userId = verifyToken(req); // ⬅️ Get userId from token

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Questions must be an array" }, { status: 400 });
    }

    await connectDB();

    const newInterview = await InterviewSession.create({
      userId,
      questions,
    });

    return NextResponse.json(newInterview, { status: 201 });
  } catch (error) {
    console.error("POST /api/interview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Get all interview sessions (can be public or protected — you decide)
export async function GET() {
  try {
    await connectDB();

    const interviews = await InterviewSession.find()
      .populate("userId", "name email") // Optional: populate user info
      .sort({ createdAt: -1 });

    return NextResponse.json(interviews, { status: 200 });
  } catch (error) {
    console.error("GET /api/interview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
