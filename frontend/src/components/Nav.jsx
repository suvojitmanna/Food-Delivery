import axios from "axios";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FaLocationDot, FaXmark, FaGear } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { MdLogout, MdOutlineDeliveryDining } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { FaPlus, FaUserCircle } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";
import { FiMic } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const { userData, city, myOrders } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false);

  const dropdownRef = useRef();
  const recognitionRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchPanelRef = useRef(null);
  const searchToggleRef = useRef(null);

  // Close dropdown and mobile search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowInfo(false);
      }
      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(e.target) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(e.target)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus mobile search when toggled
  useEffect(() => {
    if (showSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showSearch]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasVoiceSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript.replace(/[.]$/, ""));
      };

      recognition.onend = () => setIsListening(false);

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSearch("");
      recognitionRef.current.start();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      setShowSearch(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = useCallback((name) => {
    if (!name) return "GU";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, []);

  const locationString = useMemo(() => {
    return (
      [
        city?.county,
        city?.suburb,
        city?.street,
        city?.state_district,
        city?.state,
      ]
        .filter(Boolean)
        .join(", ") || "Set Location"
    );
  }, [city]);

  const activeOrders = useMemo(() => {
    return (
      myOrders?.filter((order) =>
        order.shopOrders?.some(
          (shopOrder) => shopOrder.status?.toLowerCase() !== "delivered",
        ),
      ) || []
    );
  }, [myOrders]);

  const ownerPendingOrders = useMemo(() => {
    return (
      myOrders?.filter(
        (order) =>
          order.status?.toLowerCase() === "pending" ||
          order.shopOrders?.some(
            (shopOrder) => shopOrder.status?.toLowerCase() === "pending",
          ),
      ) || []
    );
  }, [myOrders]);

  const activeDeliveries = useMemo(() => {
    return (
      myOrders?.filter(
        (order) => order.status?.toLowerCase() !== "delivered",
      ) || []
    );
  }, [myOrders]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/20 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff4d2d] to-orange-400 flex items-center justify-center shadow-lg shadow-orange-200">
                <MdOutlineDeliveryDining className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                <span className="text-[#ff4d2d]">vin</span>
                <span className="text-gray-800">go</span>
              </h1>
            </motion.div>

            {userData?.role === "user" && (
              <div className="hidden lg:flex items-center w-[450px] h-12 rounded-2xl bg-white border border-gray-200 px-4 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-[#ff4d2d]">
                <div className="flex items-center gap-2 border-r border-gray-200 pr-3 max-w-[38%]">
                  <FaLocationDot className="text-[#ff4d2d] shrink-0" />
                  <span
                    className="truncate text-xs font-bold uppercase tracking-wider text-gray-500"
                    title={locationString}
                  >
                    {locationString}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-1 pl-3 pr-1">
                  <IoIosSearch className="text-gray-400 text-xl shrink-0" />
                  <input
                    ref={desktopSearchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search restaurants, food..."
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  />
                  {hasVoiceSupport && (
                    <button
                      onClick={toggleListening}
                      aria-label={
                        isListening ? "Stop listening" : "Start voice search"
                      }
                      className={`p-1.5 rounded-full transition-all duration-300 ${
                        isListening
                          ? "bg-[#ff4d2d]/10 text-[#ff4d2d]"
                          : "text-gray-400 hover:text-[#ff4d2d] hover:bg-gray-50"
                      }`}
                    >
                      <FiMic
                        className={`text-lg ${isListening ? "animate-pulse scale-110" : ""}`}
                      />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {userData?.role === "user" && (
              <motion.button
                ref={searchToggleRef}
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

            {userData?.role === "owner" && (
              <>
                {myShopData && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 h-11 bg-[#ff4d2d]/10 border border-gray-200 hover:border-[#ff4d2d] rounded-3xl text-xs font-bold tracking-wider text-[#ff4d2d] shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => navigate("/add-item")}
                  >
                    <span className="font-semibold text-sm">Add Food</span>
                    <FaPlus size={12} className="stroke-[2]" />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative hidden lg:flex items-center gap-2 h-11 px-5 rounded-3xl border border-gray-200 bg-[#ff4d2d]/10 hover:border-[#ff4d2d] text-[#ff4d2d] transition-all duration-300 font-semibold text-sm cursor-pointer"
                  onClick={() => navigate("/my-order")}
                >
                  <TbReceipt2 size={20} className="shrink-0" />
                  <span>My Orders</span>
                  {ownerPendingOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                      {ownerPendingOrders.length}
                    </span>
                  )}
                </motion.button>
              </>
            )}

            {userData?.role === "user" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative hidden lg:flex items-center gap-2 h-11 px-5 rounded-3xl border border-gray-200 bg-[#ff4d2d]/10 hover:border-[#ff4d2d] text-[#ff4d2d] transition-all duration-300 font-semibold text-sm cursor-pointer"
                onClick={() => navigate("/my-order")}
              >
                <TbReceipt2 size={20} className="shrink-0" />
                <span>My Orders</span>
                {activeOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                    {activeOrders.length}
                  </span>
                )}
              </motion.button>
            )}

            {userData?.role === "deliveryBoy" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative hidden lg:flex items-center gap-2 h-11 px-5 rounded-3xl border border-gray-200 bg-[#ff4d2d]/10 hover:border-[#ff4d2d] text-[#ff4d2d] transition-all duration-300 font-semibold text-sm cursor-pointer"
                onClick={() => navigate("/")}
              >
                <MdOutlineDeliveryDining size={22} className="shrink-0" />
                <span>Deliveries</span>
                {activeDeliveries.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                    {activeDeliveries.length}
                  </span>
                )}
              </motion.button>
            )}

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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      >
                        <motion.div
                          variants={{ hover: { rotate: 45 } }}
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

                      {userData?.role === "user" && (
                        <motion.button
                          whileHover="hover"
                          style={{ backgroundColor: "transparent" }}
                          className="w-full flex lg:hidden items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate("/my-order")}
                        >
                          <motion.div
                            variants={{ hover: { y: -2 } }}
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
                      )}

                      {userData?.role === "owner" && (
                        <motion.button
                          whileHover="hover"
                          style={{ backgroundColor: "transparent" }}
                          className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate("/my-order")}
                        >
                          <motion.div
                            variants={{ hover: { y: -2 } }}
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
                      )}

                      {userData?.role === "deliveryBoy" && (
                        <motion.button
                          whileHover="hover"
                          style={{ backgroundColor: "transparent" }}
                          className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate("/")}
                        >
                          <motion.div
                            variants={{ hover: { y: -2 } }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 15,
                            }}
                            className="flex items-center justify-center text-lg"
                          >
                            <MdOutlineDeliveryDining />
                          </motion.div>
                          <span>Deliveries</span>
                        </motion.button>
                      )}

                      <motion.button
                        whileHover="hover"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-all text-sm font-semibold text-red-500 cursor-pointer"
                      >
                        <motion.div
                          variants={{ hover: { x: 4 } }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="flex items-center justify-center text-lg"
                        >
                          <MdLogout />
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

      <AnimatePresence>
        {showSearch && userData?.role === "user" && (
          <motion.div
            ref={searchPanelRef}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed top-20 left-0 w-full z-40 px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FaLocationDot className="text-[#ff4d2d] text-sm shrink-0" />
                <span className="truncate text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {locationString}
                </span>
              </div>

              <div className="flex items-center h-12 rounded-2xl bg-gray-50 border border-gray-200 px-3 focus-within:border-[#ff4d2d] focus-within:bg-white transition-all duration-300">
                <IoIosSearch className="text-gray-400 text-xl shrink-0 ml-1" />
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={search}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your favourite food..."
                  className="w-full h-full px-3 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />

                {hasVoiceSupport && (
                  <button
                    onClick={toggleListening}
                    aria-label={
                      isListening ? "Stop listening" : "Start voice search"
                    }
                    className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${
                      isListening
                        ? "bg-[#ff4d2d]/10 text-[#ff4d2d]"
                        : "text-gray-400 hover:text-[#ff4d2d] hover:bg-gray-100"
                    }`}
                  >
                    <FiMic
                      className={`text-lg ${isListening ? "animate-pulse scale-110" : ""}`}
                    />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
