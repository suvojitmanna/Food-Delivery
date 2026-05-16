import express from "express";
import passport from "passport";

import {
    googleAuthSuccess,
    resetPassword,
    sendOtp,
    signin,
    signOut,
    signup,
    verifyOtp,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/signout", signOut);

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"], })
);

/* google callback */
authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login", }),
    googleAuthSuccess
);

export default authRouter;