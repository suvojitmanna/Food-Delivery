import express from "express"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User Already exist." })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 character." })
        }
        if(mobile.length<10){
            return res.status(400).json({ message: "Please input a correct mobile number." })
        }
        const hashedPassword = await bcrypt.hash(password,10)
        user = 
    } catch (error) {

    }
}