import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    // Change Number -> String
    mobile: {
      type: String,
      trim: true,
      default: "",
      unique: true,
      sparse: true,
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

    isMobileVerified: {
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
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },

    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        validate: {
          validator: (value) => value.length === 2,
          message: "Coordinates must contain [longitude, latitude]",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;