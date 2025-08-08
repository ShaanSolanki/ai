import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession", required: true },
    text: { type: String },
    confidence: { type: Number },
    correct: { type: Boolean },
    accuracy: { type: Number },
    explanation: { type: String },
  },
  { timestamps: true }
);

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default Feedback;
