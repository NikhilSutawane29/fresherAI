import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../config/llm.js";

export const resumeAgent = async (resumeText) => {
  try {
    const response = await llm.invoke([
      new SystemMessage(`
        You are an Expert ATS Resume Analyzer.
        Analyze the given resume.

        Extract the following information:
        - Full Name
        - Email
        - Phone Number
        - Professional Summary
        - Technical Skills
        - Projects
        - Education
        - Experience
        - Strengths
        - Weaknesses
        - Missing Skills
        - Suggested Job Role
        - ATS Score (0-100)
        - Recommendations

        IMPORTANT RULES:
        1. Return ONLY valid raw JSON.
        2. Do not use markdown backticks (e.g. \`\`\`json).
        3. Do not explain anything.
        4. Every field must exist.

        Response Format:
        {
          "name":"",
          "email":"",
          "phone":"",
          "summary":"",
          "skills":[],
          "projects":[],
          "education":[],
          "experience":[],
          "strengths":[],
          "weaknesses":[],
          "missingSkills":[],
          "suggestedRole":"",
          "score":0,
          "recommendations":[]
        }
      `),
      new HumanMessage(resumeText)
    ]);

    // 1. Get the string from response.content
    const rawContent = response.content;

    // 2. Clean out any potential markdown backticks
    const cleanedContent = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 3. Parse and return the JSON object
    return JSON.parse(cleanedContent);

  } catch (error) {
    console.error("Failed to process resume JSON:", error);
    throw new Error("Invalid response format from AI");
  }
};