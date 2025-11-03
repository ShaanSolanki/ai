import mongoose from "mongoose";

const questionHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        topic: {
            type: String,
            required: true
        },
        questionText: {
            type: String,
            required: true
        },
        questionKey: {
            type: String,
            required: true
        }, // Normalized version for duplicate detection
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterviewSession"
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 2592000 // 30 days TTL
        }
    },
    {
        timestamps: true,
        indexes: [
            { userId: 1, topic: 1 },
            { userId: 1, questionKey: 1 },
            { createdAt: 1 }
        ]
    }
);

const QuestionHistory =
    mongoose.models.QuestionHistory || mongoose.model("QuestionHistory", questionHistorySchema);

export default QuestionHistory;