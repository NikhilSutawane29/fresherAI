import mongoose, { mongo } from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      // current user Id - we get those id through gateway
      type: mongoose.Schema.Types.ObjectId, // through this id we access user's resume
      // for those userID we access those user Id from "Headers"
      required: true,
      unique: true,
      index: true,
    },
    extractedText: {
      // we extract our text from pdf, and we save those text in that field "extractedText"
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    education: {
      type: [
        {
          institution: String,
          degree: String,
          cgpa: String,
          gpa: String,
          duration: String,
        },
      ],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: {
      type: [
        {
          name: String,
          description: String,
        },
      ],
      default: [],
    },
    experience: {
      type: [
        {
          role: String,
          description: String,
        },
      ],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    suggestedRole: {
      type: String,
      default: "",
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;

// Note - we store only one resume for one user, if user upload another resume, so we overwrite it on those old resume
