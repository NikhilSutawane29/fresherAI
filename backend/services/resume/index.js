
import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import resumeRouter from "./routes/resume.route.js";

const app = express();

app.use(express.json()); // to get data in json

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Hello from Resume service");
});


app.use("/", resumeRouter)
 

app.listen(PORT, (req, res) => {
  console.log(`Resume-service started ${PORT}`);
  connectDB()
});

