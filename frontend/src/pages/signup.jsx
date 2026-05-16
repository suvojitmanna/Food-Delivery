import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { FiUserPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Signup = () => {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  const dispatch = useDispatch()

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data))
      toast.success("Signup successful 🎉");
      console.log(result.data);
      setTimeout(() => {
      navigate("/");
    }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Something went wrong";
      console.log(errorMessage);
      toast.error(errorMessage);
    }
  };
  
const handleGoogleLogin =() => {
  try {
    window.location.href = `${serverUrl}/api/auth/google`;
  } catch (error) {
    console.log(error.message);

    toast.error("Google Login Failed");
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex items-center justify-center p-2"
      style={{ backgroundColor: bgColor }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
        style={{ border: `1px solid ${borderColor}` }}
      >
        {/* Heading */}
        <motion.h1
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-1"
          style={{ color: primaryColor }}
        >
          Vingo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-3 text-sm"
        >
          Create your account to get started with delicious food deliveries.
        </motion.p>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Full Name */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-3"
          >
            <label
              htmlFor="fullName"
              className="block text-gray-700 font-medium mb-1"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300" required
              onChange={(e) => setFullname(e.target.value)}
              value={fullName}
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-3"
          >
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-1"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300" required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </motion.div>

          {/* Mobile */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-3"
          >
            <label
              htmlFor="mobileNumber"
              className="block text-gray-700 font-medium mb-1"
            >
              Mobile Number
            </label>

            <input
              id="mobileNumber"
              type="tel"
              placeholder="Enter your mobile number"
              pattern="[0-9]{10}"
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300" required
              onChange={(e) => setMobile(e.target.value)}
              value={mobile}
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-2"
          >
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-1"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl pl-3 pr-10 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300" required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <IoEyeOutline size={20} />
                ) : (
                  <IoEyeOffOutline size={20} />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Role */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-3"
          >
            <label
              htmlFor="role"
              className="block text-gray-700 font-medium mb-1"
            >
              Role
            </label>

            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 px-2 py-2 rounded-lg border text-center text-sm font-medium transition-all cursor-pointer"
                  style={
                    role === r
                      ? {
                          backgroundColor: primaryColor,
                          color: "white",
                          borderColor: primaryColor,
                        }
                      : {
                          border: `1px solid ${primaryColor}`,
                          color: primaryColor,
                        }
                  }
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Sign Up Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            onClick={handleSignup}
            className="w-full text-white font-bold py-2.5 rounded-xl shadow-md transition-all hover:opacity-90 bg-[#ff4d2d] hover:bg-[#e64323] cursor-pointer flex items-center justify-center gap-2"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiUserPlus size={20} />
            </motion.span>

            <motion.span
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
              }}
            >
              Sign Up
            </motion.span>
          </motion.button>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-700 rounded-xl px-4 py-2 transition-colors duration-200 cursor-pointer bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={handleGoogleLogin}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FcGoogle size={20} />
            </motion.div>

            <motion.span
              className="font-medium"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              Sign in with Google
            </motion.span>
          </motion.button>

          {/* Sign In */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-3 text-sm"
          >
            Already have an account?{" "}
            <span
              className="text-[#ff4d2d] cursor-pointer hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign in
            </span>
          </motion.p>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
