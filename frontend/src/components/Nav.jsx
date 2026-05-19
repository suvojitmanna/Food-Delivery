import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaLocationDot, FaXmark, FaGear } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { TiShoppingCart } from "react-icons/ti";
import { MdLogout, MdOutlineDeliveryDining } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { FaPlus, FaUserCircle } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";

const Nav = () => {
  const { userData, city } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const dispatch = useDispatch();

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(2);

  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "GU";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const locationString =
    [city?.suburb, city?.street, city?.state_district, city?.state]
      .filter(Boolean)
      .join(", ") || "Set Location";

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/20 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-8">
            {/* LOGO */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff4d2d] to-orange-400 flex items-center justify-center shadow-lg shadow-orange-200">
                <MdOutlineDeliveryDining className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                <span className="text-[#ff4d2d]">vin</span>
                <span className="text-gray-800">go</span>
              </h1>
            </motion.div>

            {/* DESKTOP SEARCH */}
            {userData?.role === "user" && (
              <div className="hidden lg:flex items-center w-[450px] h-12 rounded-2xl bg-white border border-gray-200 px-4 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-[#ff4d2d]">
                {/* LOCATION */}
                <div className="flex items-center gap-2 border-r border-gray-200 pr-3 max-w-[38%]">
                  <FaLocationDot className="text-[#ff4d2d] shrink-0" />
                  <span
                    className="truncate text-xs font-bold uppercase tracking-wider text-gray-500"
                    title={locationString}
                  >
                    {locationString}
                  </span>
                </div>

                {/* INPUT */}
                <div className="flex items-center gap-3 flex-1 pl-3">
                  <IoIosSearch className="text-gray-400 text-xl" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search restaurants, food..."
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* MOBILE SEARCH TOGGLE */}
            {userData?.role === "user" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#ff4d2d]/10 transition-all"
              >
                {showSearch ? (
                  <FaXmark className="text-xl text-[#ff4d2d]" />
                ) : (
                  <IoIosSearch className="text-2xl text-gray-700" />
                )}
              </motion.button>
            )}

            {/* ORDERS & ACTIONS */}
            {userData?.role === "owner" ? (
              <>
                {myShopData && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 h-11 bg-[#ff4d2d]/10 border border-gray-200 hover:border-[#ff4d2d] rounded-3xl text-xs font-bold  tracking-wider text-[#ff4d2d] shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <span className="font-semibold text-sm">
                      Add Food Items{" "}
                    </span>
                    <FaPlus size={12} className="stroke-[2]" />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center justify-center md:justify-start gap-2 w-11 md:w-auto h-11 md:px-5 rounded-full md:rounded-3xl border border-gray-200 bg-[#ff4d2d]/10 hover:border-[#ff4d2d] text-[#ff4d2d] transition-all duration-300 font-semibold text-sm cursor-pointer"
                >
                  <TbReceipt2 size={20} className="shrink-0" />
                  <span className="hidden md:inline">My Orders</span>
                  <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                    0
                  </span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center md:justify-start gap-2 w-11 md:w-auto h-11 md:px-5 rounded-full md:rounded-3xl border border-gray-200 bg-[#ff4d2d]/10 hover:border-[#ff4d2d] text-[#ff4d2d] transition-all duration-300 font-semibold text-sm cursor-pointer"
              >
                <TbReceipt2 size={20} className="shrink-0" />
                <span className="hidden md:inline">My Orders</span>
              </motion.button>
            )}

            {/* CART */}
            {userData?.role === "user" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-11 h-11 rounded-full bg-gray-100 hover:bg-[#ff4d2d]/10 flex items-center justify-center transition-all duration-300 group cursor-pointer"
              >
                <TiShoppingCart className="text-2xl text-gray-700 group-hover:text-[#ff4d2d]" />
                <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              </motion.button>
            )}

            {/* USER PROFILE DROPDOWN TRIGGER */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowInfo(!showInfo)}
                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-2 border-transparent hover:border-[#ff4d2d]/30 transition-all duration-300 shadow-sm flex items-center justify-center cursor-pointer"
              >
                {!userData?.profilePic ? (
                  <span className="font-bold text-gray-700 text-sm">
                    {getInitials(userData?.fullName)}
                  </span>
                ) : (
                  <img
                    src={userData.profilePic}
                    alt="profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.button>

              {/* PROFILE MENU PANEL */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-16 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden z-50"
                  >
                    <div>
                      {/* TOP HEADER */}
                      <div className="px-5 py-5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100 flex justify-between items-center gap-3">
                        <div className="truncate flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Signed in as
                          </p>
                          <h3
                            className="text-sm font-bold text-gray-800 mt-0.5 truncate uppercase"
                            title={userData?.fullName || "Guest User"}
                          >
                            {userData?.fullName || "Guest User"}
                          </h3>
                          {userData?.role && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-[#ff4d2d] text-[10px] font-bold uppercase tracking-wider rounded-md">
                              {userData.role}
                            </span>
                          )}
                        </div>

                        {/* PROFILE IMAGE PANEL */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                          {userData?.profilePic ? (
                            <img
                              src={userData.profilePic}
                              alt={userData?.fullName || "User profile"}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FaUserCircle className="text-gray-400 text-3xl" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <motion.button
                        whileHover="hover"
                        style={{ backgroundColor: "transparent" }}
                        whileHover={{
                          backgroundColor: "rgba(249, 250, 251, 1)",
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        <motion.div
                          variants={{
                            hover: { rotate: 45 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                          }}
                          className="flex items-center justify-center text-lg"
                        >
                          <FaGear />
                        </motion.div>
                        <span>Account Settings</span>
                      </motion.button>

                      <motion.button
                        whileHover="hover"
                        style={{ backgroundColor: "transparent" }}
                        whileHover={{
                          backgroundColor: "rgba(249, 250, 251, 1)",
                        }}
                        className="md:hidden w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        <motion.div
                          variants={{
                            hover: { y: -2 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className="flex items-center justify-center text-lg"
                        >
                          <TbReceipt2 />
                        </motion.div>
                        <span>My Orders</span>
                      </motion.button>

                      <motion.button
                        whileHover="hover"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-all text-sm font-semibold text-red-500 cursor-pointer"
                      >
                        <motion.div
                          variants={{
                            hover: { x: 4 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="flex items-center justify-center"
                        >
                          <MdLogout className="text-lg" />
                        </motion.div>
                        Logout
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH PANEL */}
      <AnimatePresence>
        {showSearch && userData?.role === "user" && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed top-20 left-0 w-full z-40 px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-3">
              {/* Location */}
              <div className="flex items-center gap-2">
                <FaLocationDot className="text-[#ff4d2d] text-sm shrink-0" />
                <span className="truncate text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {locationString}
                </span>
              </div>

              {/* Search Box */}
              <div className="flex items-center h-12 rounded-2xl bg-gray-50 border border-gray-200 px-4 focus-within:border-[#ff4d2d] focus-within:bg-white transition-all duration-300">
                <IoIosSearch className="text-gray-400 text-xl" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your favourite food..."
                  className="w-full h-full px-3 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE SPACING */}
      <div className="h-24" />
    </>
  );
};

export default Nav;
