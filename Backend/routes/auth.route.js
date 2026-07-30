import express from "express";
import passport from "passport";

import {
    completeProfile,
    googleAuthSuccess,
    resetPassword,
    sendOtp,
    signin,
    signOut,
    signup,
    verifyOtp,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/signout", signOut);

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"], })
);
authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/signin", }),
    googleAuthSuccess
);
authRouter.put("/select-role", isAuth, completeProfile
);

export default authRouter;