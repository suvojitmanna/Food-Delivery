import React, { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

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

      console.log(result.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-2"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-3xl font-bold mb-1" style={{ color: primaryColor }}>
          Vingo
        </h1>

        <p className="text-gray-600 mb-3 text-sm">
          Create your account to get started with delicious food deliveries.
        </p>

        <form>
          {/* Full Name */}
          <div className="mb-3">
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
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              onChange={(e) => setFullname(e.target.value)}
              value={fullName}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
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
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          {/* Mobile */}
          <div className="mb-3">
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
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              onChange={(e) => setMobile(e.target.value)}
              value={mobile}
            />
          </div>

          {/* Password */}
          <div className="mb-2">
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
                className="w-full rounded-xl pl-3 pr-10 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <IoEyeOutline size={20} />
                ) : (
                  <IoEyeOffOutline size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mb-3">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-[#ff4d2d] cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          {/* Role */}
          <div className="mb-3">
            <label
              htmlFor="role"
              className="block text-gray-700 font-medium mb-1"
            >
              Role
            </label>

            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
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
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full text-white font-bold py-2.5 rounded-xl shadow-md transition-all hover:opacity-90 bg-[#ff4d2d] hover:bg-[#e64323] cursor-pointer"
            onClick={handleSignup}
          >
            Sign Up
          </button>

          {/* Google Button */}
          <button
            type="button"
            className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-700 rounded-xl px-4 py-2 transition-colors duration-200 cursor-pointer bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <FcGoogle size={20} />
            <span className="font-medium">Sign up with Google</span>
          </button>

          {/* Sign In */}
          <p className="text-center mt-3 text-sm">
            Already have an account?{" "}
            <span
              className="text-[#ff4d2d] cursor-pointer hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
