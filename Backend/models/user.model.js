import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            unique: true,
            required: true,
        },

        password: {
            type: String,
            required: true,
        },

        mobile: {
            type: Number,
            required: true,
        },

        role: {
            type: String,
            enum: ["user", "owner", "deliveryBoy"],
            required: true,
        },
        resetOtp:{
            type:String
        },
        isOtpVerified:{
            type:String,
            default:false
        },
        otpExpires:{
            type:Date
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema)
export default User