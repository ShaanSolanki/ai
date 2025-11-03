import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/interviewsession";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        // Await params before using
        const { sessionId } = await params;

        // Check authentication
        const authHeader = request.headers.get("authorization");
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

        await connectDB();

        const session = await InterviewSession.findOne({
            _id: sessionId,
            userId: decoded.userId
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Calculate detailed statistics
        const questions = session.questions;
        const totalQuestions = questions.length;
        const answeredQuestions = questions.filter((q: any) => q.answerText?.trim()).length;
        const questionsWithFeedback = questions.filter((q: any) => q.feedback).length;

        const scores = questions
            .filter((q: any) => q.feedback?.accuracy !== undefined)
            .map((q: any) => q.feedback.accuracy);

        const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

        // Categorize performance by difficulty
        const performanceByDifficulty = {
            easy: { total: 0, correct: 0, avgScore: 0 },
            intermediate: { total: 0, correct: 0, avgScore: 0 },
            advanced: { total: 0, correct: 0, avgScore: 0 }
        };

        questions.forEach((q: any) => {
            const difficulty = q.difficulty || 'intermediate';
            if (performanceByDifficulty[difficulty as keyof typeof performanceByDifficulty]) {
                performanceByDifficulty[difficulty as keyof typeof performanceByDifficulty].total++;
                if (q.feedback?.correct) {
                    performanceByDifficulty[difficulty as keyof typeof performanceByDifficulty].correct++;
                }
                if (q.feedback?.accuracy) {
                    performanceByDifficulty[difficulty as keyof typeof performanceByDifficulty].avgScore += q.feedback.accuracy;
                }
            }
        });

        // Calculate averages for each difficulty
        Object.keys(performanceByDifficulty).forEach(key => {
            const perf = performanceByDifficulty[key as keyof typeof performanceByDifficulty];
            if (perf.total > 0) {
                perf.avgScore = perf.avgScore / perf.total;
            }
        });

        // Prepare detailed results
        const detailedResults = {
            sessionInfo: {
                id: session._id,
                topic: session.topic,
                difficulty: session.difficulty,
                questionType: session.questionType,
                createdAt: session.createdAt,
                completed: session.completed,
                totalQuestions,
                answeredQuestions
            },
            overallPerformance: {
                averageScore: Math.round(averageScore),
                highestScore: Math.round(highestScore),
                lowestScore: Math.round(lowestScore),
                completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
                passRate: averageScore >= 70 ? 'Pass' : 'Needs Improvement'
            },
            performanceByDifficulty,
            sessionFeedback: session.sessionFeedback,
            questions: questions.map((q: any, index: number) => ({
                id: q._id,
                questionNumber: index + 1,
                questionText: q.questionText,
                answerText: q.answerText,
                difficulty: q.difficulty,
                type: q.type,
                feedback: q.feedback ? {
                    score: Math.round(q.feedback.accuracy || 0),
                    correct: q.feedback.correct,
                    explanation: q.feedback.explanation,
                    strengths: q.feedback.strengths || [],
                    improvements: q.feedback.improvements || []
                } : null
            })),
            recommendations: generateRecommendations(averageScore, performanceByDifficulty, session.topic)
        };

        return NextResponse.json(detailedResults);
    } catch (error) {
        console.error("Error fetching session results:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function generateRecommendations(averageScore: number, performanceByDifficulty: any, topic: string) {
    const recommendations = [];

    if (averageScore < 50) {
        recommendations.push({
            type: "critical",
            title: "Focus on Fundamentals",
            description: `Your ${topic} fundamentals need strengthening. Consider reviewing basic concepts and practicing more.`
        });
    } else if (averageScore < 70) {
        recommendations.push({
            type: "improvement",
            title: "Build on Your Foundation",
            description: `You have a good foundation in ${topic}. Focus on practicing more complex scenarios.`
        });
    } else {
        recommendations.push({
            type: "success",
            title: "Strong Performance",
            description: `Excellent work! You demonstrate strong ${topic} knowledge. Keep practicing to maintain this level.`
        });
    }

    // Difficulty-specific recommendations
    if (performanceByDifficulty.easy.avgScore < 70) {
        recommendations.push({
            type: "improvement",
            title: "Master the Basics",
            description: "Focus on fundamental concepts before moving to advanced topics."
        });
    }

    if (performanceByDifficulty.advanced.total > 0 && performanceByDifficulty.advanced.avgScore < 60) {
        recommendations.push({
            type: "improvement",
            title: "Advanced Topics Need Work",
            description: "Consider additional study on advanced concepts and real-world applications."
        });
    }

    return recommendations;
}