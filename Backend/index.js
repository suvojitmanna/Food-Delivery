import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors"

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.VITE_CLIENT_URL || "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)

connectDb()
app.get("/", (req, res) => {
    res.send("Server is running...");
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});