

import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import interviewRouter from "./routes/interview.route.js";

const app = express();

app.use(express.json()); // to get data in json

const PORT = process.env.PORT || 3002;

app.get("/", (req, res) => {
  res.send("Hello from interview service");
}); 

app.use("/", interviewRouter);

app.listen(PORT, (req, res) => {
  console.log(`Interview-service started ${PORT}`);
  connectDB()
});


