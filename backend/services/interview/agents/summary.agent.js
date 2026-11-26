import { llm } from "../../resume/config/llm.js";
import summaryPrompt from "../prompts/summaryPrompt.js";


// Feedback Agent can generate feedback for each 6 question from AI
export const summaryAgent = async (data) => {
  try {
    
    const prompt = summaryPrompt(data)
      
    // we invoke our llm
    const response = await llm.invoke(prompt);

    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned)

  } catch (error) {
    console.error("Failed agent to generate response", error);
    console.log(response.content);
    throw new Error("Invalid response format from AI summary");
  }
};

