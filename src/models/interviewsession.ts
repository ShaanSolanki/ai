import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    answerText: { type: String }, // Store user's answer to this question
    feedback: {
      text: { type: String },        // Full feedback result (raw JSON from Gemini)
      confidence: { type: Number },  // Confidence (0-1)
      correct: { type: Boolean },    // Correct/wrong
      accuracy: { type: Number },    // Percentage
      explanation: { type: String }, // Details/suggestions
    },
  },
  { timestamps: true }
);

// const answerSchema = new mongoose.Schema(
//   {
//     questionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "InterviewSession.questions",
//     },
//     answerText: { type: String, required: true },
//   },
//   { _id: false }
// );

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [questionSchema],
    currentQuestionIndex: { type: Number, default: 0 },
    // answers: { type: [answerSchema], default: [] },

    // <-- New field to store overall session feedback
    sessionFeedback: {
      text: { type: String },
      confidence: { type: Number },
      correct: { type: Boolean },
      accuracy: { type: Number },
      explanation: { type: String },
    },
  },
  { timestamps: true }
);

const InterviewSession =
  mongoose.models.InterviewSession || mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;
