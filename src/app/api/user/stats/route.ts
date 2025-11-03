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

        // Fetch user's interview sessions for stats
        const sessions = await InterviewSession.find({
            $or: [
                { userId: decoded.userId },
                { email: decoded.email }
            ]
        }).lean();

        // Calculate stats
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.completed).length;
        const totalQuestions = sessions.reduce((sum, s) => sum + (s.answers ? s.answers.length : 0), 0);

        // Calculate average score (mock for now)
        const scores = sessions.map(s => s.score || Math.floor(Math.random() * 40) + 60);
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

        // Get favorite topics
        const topicCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
            const topic = session.topic || 'General';
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });

        const favoriteTopics = Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([topic]) => topic);

        const stats = {
            totalSessions,
            completedSessions,
            averageScore,
            totalQuestions,
            favoriteTopics
        };

        return NextResponse.json({ stats });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}