


import "dotenv/config";
import express from "express";
import { connectDB } from "./configs/db.js";
import roadmapRouter from "./routes/roadmap.route.js";

const app = express();

app.use(express.json()); // to get data in json

const PORT = process.env.PORT || 3003;

app.use("/", roadmapRouter)

app.listen(PORT, (req, res) => {
  console.log(`Roadmap-service started ${PORT}`);
  connectDB()
});



