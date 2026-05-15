import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(3);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (!email) return;

    console.log("OTP sent to:", email);
  };

  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, step]);

  const handleResendOtp = () => {
    console.log("OTP Resent");

    setTimer(30);
    setCanResend(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]"
    >
      <motion.div
        initial={{ y: 30, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.9 }}>
            <IoIosArrowRoundBack
              size={30}
              className="text-[#ff4d2d] cursor-pointer"
              onClick={() => navigate("/signin")}
            />
          </motion.div>

          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
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
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSendOtp}
              className="w-full mt-4 text-white font-bold py-2.5 rounded-xl shadow-md transition-all hover:opacity-90 bg-[#ff4d2d] hover:bg-[#e64323] cursor-pointer flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MdOutlineEmail size={20} />
              </motion.span>

              <motion.span
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                Send OTP
              </motion.span>
            </motion.button>
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <label
              htmlFor="otp"
              className="block text-gray-700 font-medium mb-1"
            >
              Enter OTP
            </label>

            <input
              id="otp"
              type="text"
              placeholder="Enter 6 digit OTP"
              maxLength={6}
              className="w-full rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 tracking-widest"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full mt-4 text-white font-bold py-2.5 rounded-xl shadow-md transition-all hover:opacity-90 bg-[#ff4d2d] hover:bg-[#e64323] cursor-pointer flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MdVerifiedUser size={20} />
              </motion.span>

              <motion.span
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                Verify OTP
              </motion.span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500 mt-3 text-center"
            >
              {canResend ? (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResendOtp}
                  className="text-[#ff4d2d] cursor-pointer hover:underline font-medium"
                >
                  Resend OTP
                </motion.span>
              ) : (
                <span>
                  Resend OTP in{" "}
                  <span className="text-[#ff4d2d] font-semibold">{timer}s</span>
                </span>
              )}
            </motion.p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full rounded-xl px-3 py-2 pr-10 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl px-3 py-2 pr-10 outline-none border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full mt-2 text-white font-bold py-2.5 rounded-xl shadow-md transition-all hover:opacity-90 bg-[#ff4d2d] hover:bg-[#e64323] cursor-pointer flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <RiLockPasswordLine size={20} />
              </motion.span>

              <motion.span
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                Reset Password
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
