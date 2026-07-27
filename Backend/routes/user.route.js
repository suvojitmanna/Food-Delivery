import express from "express";
import { getCurrentUser, updateRole, updateUserLocation } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter = express.Router();
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.put("/update-role", isAuth, updateRole);
userRouter.post("/update-location", isAuth, updateUserLocation);

export default userRouter;