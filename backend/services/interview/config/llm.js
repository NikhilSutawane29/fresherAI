
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv"
dotenv.config()

export const llm = new ChatOpenAI({
  modelName: "openai/gpt-4o-mini", // Model prefix required by AICredits
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  // Enforces native JSON mode at the API request level
  modelKwargs: {
    response_format: { type: "json_object" },
  },
});
