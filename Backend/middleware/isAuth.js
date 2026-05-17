import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // attach user
        req.user = user;

        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};