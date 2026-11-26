import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json()); // to get data in json
app.use(cookieParser()); // to access cookiew

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from Auth service");
});

app.use("/", authRouter);
// when we request on that /api/auth/"login|logout" -> it goes to authRouter

app.listen(PORT, (req, res) => {
  console.log(`Auth-service started ${PORT}`);
  connectDB();
});
