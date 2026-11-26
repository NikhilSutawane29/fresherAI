import mongoose from "mongoose";


// we use this feedbackSchema after submiting any question, means with each and every question has feedbackSchema
// we use this in our "Dashboard"
const feedbackSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      default: 0,
    },
    correctness: {
      type: Number,
      default: 0,
    },
    clarity: {
      type: Number,
      default: 0,
    },
    relevance: {
      type: Number,
      default: 0,
    },
    detail: {
      type: Number,
      default: 0,
    },
    efficiency: {
      type: Number,
      default: 0,
    },
    communication: {
      type: Number,
      default: 0,
    },
    problemSolving: {
      type: Number,
      default: 0,
    },
    creativity: {
      type: Number,
      default: 0,
    },
    feedback: { // Ai give feedback after submit any question
      type: String,
      default: "",
    },
    improvements: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

// particular question schema
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    userAnswer: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    timer: {
      type: Number,
      default: 60,
    },
    feedback: {
      type: feedbackSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      // curr user id, which we send through gateway in "headers"
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["hr", "technical"],
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    useResume: {
      // user can start interview based on his resume
      type: Boolean,
      default: false,
    },
    currentQuestion: {
      // in one interview their are 6 questions, so we define currentQuestion becasue we know that currently our user is on which question
      type: Number,
      default: 0,
    },
    questions: {
      // 6 Qs in question arr
      type: [questionSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true },
);


const Interview = mongoose.model("Interview", interviewSchema)

export default Interview