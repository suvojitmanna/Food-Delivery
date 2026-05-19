import express from "express";
import { getCurrentUser, updateRole } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter = express.Router();
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.put("/update-role", isAuth, updateRole);

export default userRouter;