
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve the roadmap service's .env independently of the process working directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const llm = new ChatOpenAI({
  model: "openai/gpt-4o-mini", // AICredits requires the provider prefix
  temperature: 0.2,
  maxTokens: 4000,
  maxRetries: 2,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL, // Points to https://aicredits.in/v1
  },
});

export default llm;  






/*

FRONTEND
   │
   ▼
POST /generate-roadmap
   │
   ▼
Roadmap Controller
   │
   ▼
graph.invoke(state)
   │
   ▼
LangGraph (State = RoadmapState)
   │
   ▼
roadmapAgent
   │
   ▼
Groq / Llama 3.3
   │
   ▼
Personalized Roadmap JSON
   │
   ▼
resourceAgent
   ├──► YouTube Search & Virtual Code First
   └──► Groq LLM Documentation
   │
   ▼
Roadmap + Resources
   │
   ▼
END
   │
   ▼
MongoDB Save
   │
   ▼
Redis

*/