

import "dotenv/config";
import express from "express";
import { connectDB } from "./configs/db.js";
import billingRouter from "./routes/billing.route.js";

const app = express();

app.use(express.json()); // to get data in json

const PORT = process.env.PORT || 3004;

app.get("/", (req, res) => {
    res.send("Hello Billing service")
})

app.use("/", billingRouter)

app.listen(PORT, (req, res) => {
  console.log(`Billing-service started ${PORT}`);
  connectDB();
});



