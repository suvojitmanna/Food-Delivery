import express from "express";
import { getCurrentUser, updateRole } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter = express.Router();
console.log("user route loaded");
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.put("/update-role", isAuth, updateRole);

export default userRouter;