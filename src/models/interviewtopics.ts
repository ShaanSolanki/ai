import mongoose  from "mongoose";

const interviewTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const InterviewTopic = mongoose.models.InterviewTopic||mongoose.model("InterviewTopic", interviewTopicSchema);

export default InterviewTopic;
