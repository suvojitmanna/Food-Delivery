import React, { useState } from "react";
import { roles } from "../assets/role";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      if (!selectedRole) return;
      setIsSubmitting(true);

      const result = await axios.put(
        `${serverUrl}/api/user/update-role`,
        { role: selectedRole },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data.user));
      navigate("/");
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.05 
      }
    }
  };

  const elementVariants = {
    hidden: { y: 25, opacity: 0, scale: 0.98 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 220, damping: 22 }
    }
  };

  const activeColor = roles.find((r) => r.key === selectedRole)?.color || "#1a1a24";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#fff9f6] text-[#1a1a24] font-sans box-border selection:bg-transparent">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(26,26,36,0.04)] w-full max-w-[440px] p-6 sm:p-8 border border-[#1a1a24]/[0.06] flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <motion.div variants={elementVariants} className="mb-8">
            <h1 className="text-[28px] sm:text-[32px] font-extrabold m-0 mb-2 text-[#1a1a24] tracking-tight">
              Choose Your Role
            </h1>
            <p className="text-sm sm:text-base text-[#1a1a24]/50 m-0 font-medium leading-relaxed">
              Select how you want to use the platform to continue
            </p>
          </motion.div>

          {/* Roles Options Stack */}
          <div className="flex flex-col gap-3.5 mb-8">
            {roles.map((role) => {
              const isSelected = selectedRole === role.key;
              const isHovered = hoveredRole === role.key;

              return (
                <motion.button
                  key={role.key}
                  variants={elementVariants}
                  onClick={() => setSelectedRole(role.key)}
                  onMouseEnter={() => setHoveredRole(role.key)}
                  onMouseLeave={() => setHoveredRole(null)}
                  whileTap={{ scale: 0.99 }}
                  className="relative flex items-center gap-4 p-4.5 rounded-2xl border-2 text-left cursor-pointer w-full text-inherit outline-none overflow-hidden transition-colors duration-300"
                  style={{
                    borderColor: isSelected
                      ? role.color
                      : isHovered
                      ? "rgba(26, 26, 36, 0.18)"
                      : "rgba(26, 26, 36, 0.06)",
                  }}
                >
                  {/* Dynamic Layout morph background layer */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        layoutId="premiumGlowBg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{ backgroundColor: `${role.color}10` }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Component Core Content Wrapper */}
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <motion.span
                      animate={{ scale: isSelected ? 1.08 : isHovered ? 1.04 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="text-[32px] sm:text-[34px] select-none filter drop-shadow-sm flex-shrink-0"
                    >
                      {role.icon}
                    </motion.span>

                    <div className="flex-1 min-w-0">
                      <div className="text-base sm:text-[17px] font-bold mb-0.5 text-[#1a1a24] tracking-tight truncate">
                        {role.label}
                      </div>
                      <div className="text-[13px] sm:text-sm text-[#1a1a24]/60 font-medium leading-normal">
                        {role.desc}
                      </div>
                    </div>

                    {/* Premium Circle Dot Selector */}
                    <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full border border-[#1a1a24]/12 bg-white flex-shrink-0">
                      {isSelected && (
                        <motion.div
                          layoutId="premiumActiveDot"
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: role.color }}
                          transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Action Call to Action Button */}
        <motion.button
          variants={elementVariants}
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
          whileTap={selectedRole && !isSubmitting ? { scale: 0.985 } : {}}
          animate={{
            backgroundColor: selectedRole ? activeColor : "rgba(26, 26, 36, 0.05)",
            color: selectedRole ? "#ffffff" : "rgba(26, 26, 36, 0.3)",
            boxShadow: selectedRole && !isSubmitting
              ? `0 14px 28px -8px ${activeColor}40`
              : "0 0px 0px rgba(0,0,0,0)",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className={`
            w-full p-4 rounded-xl text-[15px] font-bold border-none tracking-wide flex items-center justify-center min-h-[54px] transition-all
            ${selectedRole && !isSubmitting ? "cursor-pointer" : "cursor-not-allowed"}
          `}
        >
          {isSubmitting ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}