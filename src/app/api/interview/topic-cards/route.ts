import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InterviewTopic from "@/models/interviewtopics";

// Fetch all topics (GET)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const topics = await InterviewTopic.find({}, { title: 1, description: 1 });
    return NextResponse.json({ topics }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching topics:", err);
    return NextResponse.json(
      { message: "Failed to fetch topics", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

// Add a custom topic (POST)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Validate request body
    const reqBody = await req.json();
    const { title, description } = reqBody as { title: string; description: string };

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json(
        { message: "Title is required and should be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return NextResponse.json(
        { message: "Description is required and should be at least 5 characters." },
        { status: 400 }
      );
    }

    // Optional: prevent duplicate titles (case insensitive)
    const exists = await InterviewTopic.findOne({ title: { $regex: `^${title}$`, $options: "i" } });
    if (exists) {
      return NextResponse.json(
        { message: "A topic with this title already exists." },
        { status: 409 }
      );
    }

    // Save the new custom topic
    const topic = await InterviewTopic.create({ title: title.trim(), description: description.trim() });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating custom topic:", err);
    return NextResponse.json(
      { message: "Failed to create topic", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
