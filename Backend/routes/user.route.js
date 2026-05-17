import express from "express";
import { getCurrentUser } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter = express.Router();
console.log("user route loaded");
userRouter.get("/current", isAuth, getCurrentUser);

export default userRouter;