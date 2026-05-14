import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User Already exist." })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 character." })
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "Please input a correct mobile number." })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword
        })

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(201).json(user)
    } catch (error) {
        return res.status(500).json(`signup error ${error}`)
    }
}

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password." })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json(`signin error ${error}`)
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")

        return res.status(200).json({
            message: "Signout Successfully"
        })

    } catch (error) {
        return res.status(500).json(`signOut error ${error}`)
    }
}