import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { FaArrowRight, FaUtensils } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center capitalize ">
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-3 sm:p-4 w-full max-w-lg">
          <motion.div
            whileHover="hover"
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate("/create-edit-shop")}
            variants={{
              hover: {
                y: -6,
                boxShadow:
                  "0 30px 60px -15px rgba(255, 77, 45, 0.12), 0 10px 20px -10px rgba(0,0,0,0.04)",
              },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-orange-100/70 text-left  outline-none shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 border border-transparent group-hover:border-[#ff4d2d]/20 rounded-3xl transition-colors duration-300 pointer-events-none" />

            <div className="flex flex-col items-center text-center">
              <motion.div
                variants={{
                  hover: { y: -4, scale: 1.05 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50/50 flex items-center justify-center mb-4 border border-orange-100"
              >
                <FaUtensils className="text-[#ff4d2d] w-8 h-8 sm:w-10 sm:h-10" />
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add your restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base max-w-sm">
                join our food delivery platform and reach thousands of hungry
                customers every day.
              </p>
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
                whileHover={{ backgroundColor: "#ea3d1d" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center gap-2 bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md shadow-orange-500/10 cursor-pointer outline-none"
                onClick={() => navigate("/create-edit-shop")}
              >
                <span>Get Started</span>
                <motion.div
                  variants={{
                    hover: { x: 4 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex items-center justify-center"
                >
                  <FaArrowRight size={14} className="stroke-[1]" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
