import express from "express"
import { resetPassword, sendOtp, signin, signOut, signup, verifyOtp } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/signup", signup)
authRouter.post("/signin", signin)
authRouter.get("/signout", signOut)
authRouter.post("/send-otp", sendOtp)
authRouter.post("/verify-Otp", verifyOtp)
authRouter.post("/verify-Otp", verifyOtp)
authRouter.post("/reset-password", resetPassword)

export default authRouter;