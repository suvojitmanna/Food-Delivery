import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
    connectDb()
  console.log(`Server started at http://localhost:${port}`);
});