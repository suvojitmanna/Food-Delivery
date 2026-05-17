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
    },
    mobile: {
      type: Number,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      default: "user",
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    resetOtp: {
      type: String,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    otpExpires: {
      type: Date,
    },

    googleId: {
      type: String,
    },

    profilePic: {
      type: String,
    },

    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema)
export default User