import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 24 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 22 },
  },
};

const StatCard = ({ label, value, sub }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white/70 backdrop-blur-sm border border-orange-100 rounded-2xl p-5 shadow-[0_10px_30px_-15px_rgba(255,77,45,0.05)] w-full"
  >
    <p className="text-[10px] tracking-widest text-orange-600/60 font-semibold uppercase mb-2">
      {label}
    </p>
    <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-none m-0">
      {value}
    </p>
    <p className="text-xs text-gray-500 mt-1.5 m-0 font-light">{sub}</p>
  </motion.div>
);

const EmptyState = ({ onNavigate }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={containerVariants}
    className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] text-center px-4 sm:px-6"
  >
    {/* Badge */}
    <motion.div
      variants={fadeUp}
      className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] sm:text-xs tracking-wider text-[#ff4d2d] mb-6 sm:mb-10 font-medium uppercase"
    >
      ✦ Restaurant owner portal
    </motion.div>

    {/* Icon */}
    <motion.div
      variants={fadeUp}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-orange-100 flex items-center justify-center mx-auto mb-6 sm:mb-8 text-2xl sm:text-3xl shadow-sm"
    >
      🍽️
    </motion.div>

    {/* Heading */}
    <motion.h1
      variants={fadeUp}
      className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-gray-900 mb-4 max-w-2xl"
    >
      List your restaurant <em className="not-italic text-[#ff4d2d]">today</em>
    </motion.h1>

    {/* Subtext */}
    <motion.p
      variants={fadeUp}
      className="text-sm sm:text-base leading-relaxed text-gray-600 max-w-sm mx-auto mb-8 sm:mb-10 font-light"
    >
      Join our curated network of culinary partners and bring your kitchen to
      thousands of local food lovers.
    </motion.p>

    {/* CTA */}
    <motion.button
      variants={fadeUp}
      whileHover={{ backgroundColor: "#ea3d1d", y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate("/create-edit-shop")}
      className="inline-flex items-center gap-2 bg-[#ff4d2d] text-white border-none rounded-full px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-medium cursor-pointer font-sans shadow-lg shadow-orange-500/20 transition-all duration-300"
    >
      Add your restaurant →
    </motion.button>
  </motion.div>
);

const Dashboard = ({ shopData, onNavigate }) => {
  const [activeTab, setActiveTab] = React.useState("All items");
  const tabs = ["All items", "Starters", "Mains", "Desserts"];

  const stats = [
    {
      label: "MENU ITEMS",
      value: shopData.items?.length ?? 0,
      sub: "Tap to manage",
    },
    {
      label: "AVG RATING",
      value: shopData.rating ?? "—",
      sub: "Based on reviews",
    },
    {
      label: "ORDERS TODAY",
      value: shopData.ordersToday ?? "—",
      sub: "Live count",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 pt-6 sm:pt-12"
    >
      {/* Welcome row */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-orange-100"
      >
        <div>
          <p className="text-[10px] tracking-widest text-orange-600/60 font-semibold mb-1 uppercase">
            PARTNER DASHBOARD
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl font-black tracking-tight text-gray-900 m-0">
            Welcome back,{" "}
            <span className="text-[#ff4d2d]">{shopData.name}</span>
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 text-xs text-emerald-600 whitespace-nowrap font-medium self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Live on platform
        </div>
      </motion.div>

      {/* Stats row - Responsive Grid Fix */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      {/* Banner card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-orange-100/70 overflow-hidden shadow-[0_15px_40px_-20px_rgba(0,0,0,0.04)] group"
      >
        {/* Image */}
        <div className="relative h-48 sm:h-72 overflow-hidden">
          <motion.img
            src={shopData.image}
            alt={shopData.name}
            className="w-full h-full object-cover brightness-[0.75] block"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Banner content - Layout Wrap Fix */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex flex-row items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] tracking-widest font-semibold text-orange-200 mb-1 uppercase truncate">
                {shopData.city ? shopData.city.toUpperCase() : "ACTIVE"} ·
                PREMIUM
              </p>
              <h2 className="font-serif text-xl sm:text-3xl font-black tracking-tight text-white m-0 truncate">
                {shopData.name}
              </h2>
            </div>
            {/* Edit button */}
            <motion.button
              whileHover={{
                backgroundColor: "#ff4d2d",
                borderColor: "#ff4d2d",
                color: "#ffffff",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("/create-edit-shop")}
              aria-label="Edit restaurant"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 flex items-center justify-center cursor-pointer text-gray-700 flex-shrink-0 text-xs sm:text-sm shadow-md transition-all duration-200"
            >
              ✏
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-t border-gray-50 bg-white">
          <div className="min-w-0">
            <p className="text-[9px] tracking-wider text-gray-400 font-semibold m-0 uppercase">
              LOCATION
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-light mt-0.5 m-0 break-words">
              {shopData.address}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Menu section */}
      <motion.div variants={itemVariants} className="pb-12">
        <p className="text-[10px] tracking-widest text-orange-600/60 font-semibold mb-3 uppercase">
          MENU MANAGEMENT
        </p>

        {/* Tabs - Added horizontal scroll engine for small screens */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs rounded-lg cursor-pointer font-sans border-none whitespace-nowrap transition-all duration-200 ${
                activeTab === t
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "bg-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Empty menu state */}
        <AnimatePresence>
          {(!shopData.items || shopData.items.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white/60 backdrop-blur-sm border border-dashed border-orange-200 rounded-2xl p-6 sm:p-10 text-center flex flex-col items-center shadow-sm"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center mb-4 text-lg sm:text-xl text-[#ff4d2d]">
                +
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 mb-1">
                Your menu is empty
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto mb-6 font-light">
                Add your first dish to start receiving orders through the
                platform.
              </p>
              <motion.button
                whileHover={{
                  borderColor: "#ff4d2d",
                  color: "#ff4d2d",
                  backgroundColor: "rgba(255,77,45,0.02)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("/add-item")}
                className="inline-flex items-center gap-2 bg-transparent text-gray-700 border border-gray-300 rounded-lg px-5 py-2.5 text-xs font-medium cursor-pointer font-sans transition-all duration-200"
              >
                Build your menu →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ── ROOT COMPONENT ── */
const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-b from-[#fffbf9] to-[#fff5f0] flex flex-col items-center antialiased text-gray-800 font-sans">
        <Nav />

        <AnimatePresence mode="wait">
          {!myShopData ? (
            <EmptyState key="empty" onNavigate={navigate} />
          ) : (
            <Dashboard key="dash" shopData={myShopData} onNavigate={navigate} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default OwnerDashboard;
