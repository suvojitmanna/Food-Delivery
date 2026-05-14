import express from "express"
import { signin, signOut, signup } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.get("/signout",signOut)

export default authRouter;