import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    answerText: { type: String }, // You may optionally use this here or store only in answers[]
    feedback: { type: String },
  },
  { timestamps: true }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "InterviewSession.questions", // Embedded ref to session.questions._id
    },
    answerText: { type: String, required: true },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [questionSchema],
    currentQuestionIndex: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

const InterviewSession =
  mongoose.models.InterviewSession || mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;
