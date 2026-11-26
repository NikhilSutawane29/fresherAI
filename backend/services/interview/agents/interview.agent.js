// we use two prompts hr and technical prompt from prompt.js files

import { llm } from "../../resume/config/llm.js";
import hrInterviewPrompt from "../prompts/hrInterviewPrompt.js";
import technicalInterviewPrompt from "../prompts/technicalInterviewPrompt.js";

// Interview Agent can find 6 questions from AI
export const interviewAgent = async (data) => {
  try {
    // we define what prompt we give Ai based on type(which we get from user(frontend))
    const prompt =
      data.type?.toLowerCase() === "hr"
        ? hrInterviewPrompt(data)
        : technicalInterviewPrompt(data); // basically we compare when user send (means we get type from "Frontend") it's type either "hr" or "technical"
    // if type is "hr" so we send "hr prompt" to AI and also send it's data
    // same thing for "technical"

    // we invoke our llm
    const response = await llm.invoke(prompt);

    if (typeof response.content !== "string") {
      throw new Error("Interview model returned a non-text response");
    }

    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const questions = Array.isArray(parsed) ? parsed : parsed?.questions;

    if (!Array.isArray(questions)) {
      throw new Error("Interview model response must contain a questions array");
    }

    return questions;

  } catch (error) {
    console.error("Failed agent to generate response", error);
    throw error;
  }
};
