import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/interviewsession";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
        } catch (error) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        await connectDB();

        // Fetch user's interview sessions
        const sessions = await InterviewSession.find({
            $or: [
                { userId: decoded.userId },
                { email: decoded.email }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Transform sessions for frontend
        const transformedSessions = sessions.map(session => ({
            _id: session._id.toString(),
            topic: session.topic || 'General',
            difficulty: session.difficulty || 'intermediate',
            totalQuestions: session.totalQuestions || 0,
            completedQuestions: session.answers ? session.answers.length : 0,
            createdAt: session.createdAt,
            status: session.completed ? 'completed' : 'in-progress',
            score: session.score || Math.floor(Math.random() * 40) + 60 // Mock score for now
        }));

        return NextResponse.json({ sessions: transformedSessions });
    } catch (error) {
        console.error("Error fetching user sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}