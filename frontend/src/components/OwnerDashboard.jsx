import React, { useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "../components/ownerItemCard";
import { BiSortAlt2 } from "react-icons/bi";

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
  const [sortBy, setSortBy] = React.useState("newest");
  const [isAscending, setIsAscending] = useState(false);
  const tabs = ["All items", "Starters", "Mains", "Dessert"];

  const toggleSortDirection = () => {
    if (sortBy === "priceLow") {
      setSortBy("priceHigh");
    } else if (sortBy === "priceHigh") {
      setSortBy("priceLow");
    } else {
      setIsAscending(!isAscending);
    }
  };

  const processedItems = React.useMemo(() => {
    if (!shopData.items) return [];

    let items = [...shopData.items];
    if (activeTab !== "All items") {
      items = items.filter(
        (item) => item.category?.toLowerCase() === activeTab.toLowerCase(),
      );
    }

    return items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "priceLow":
          comparison = Number(a.price || 0) - Number(b.price || 0);
          break;
        case "priceHigh":
          comparison = Number(b.price || 0) - Number(a.price || 0);
          break;
        case "rating":
          comparison = Number(b.rating || 0) - Number(a.rating || 0);
          break;
        case "newest":
        default:
          comparison =
            new Date(b.createdAt || b.date || 0) -
            new Date(a.createdAt || a.date || 0);
          break;
      }

      if (sortBy !== "priceLow" && sortBy !== "priceHigh") {
        return isAscending ? comparison * -1 : comparison;
      }
      return comparison;
    });
  }, [shopData.items, activeTab, sortBy, isAscending]);

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

      {/* Stats row */}
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
        <div className="relative h-48 sm:h-72 overflow-hidden">
          <motion.img
            src={shopData.image}
            alt={shopData.name}
            className="w-full h-full object-cover brightness-[0.75] block"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

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
        <p className="text-[10px] tracking-[0.15em] text-orange-600/70 font-semibold mb-4 uppercase select-none">
          Menu Management
        </p>

        {/* Control Subheader Container */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-100/80">
          {/* Tabs Slider */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((t) => {
              const isActive = activeTab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`relative px-4 py-2.5 text-xs rounded-xl cursor-pointer font-sans border-none whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400 hover:text-gray-600 font-medium"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-white shadow-sm rounded-xl -z-10 border border-gray-100"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {t}
                </button>
              );
            })}
          </div>

          {/* Premium UI Sort Dropdown Selector */}
          <div className="group/main relative flex items-center gap-3 self-end sm:self-auto shrink-0 h-12 px-4 rounded-[22px] border border-white/50 bg-white/75 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.045)] hover:shadow-[0_18px_50px_rgba(255,77,45,0.12)] hover:border-orange-200/80 transition-all duration-500 overflow-hidden select-none">
            {/* ambient glow */}
            <div className="absolute inset-0 opacity-0 group-hover/main:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#ff4d2d]/5 via-orange-400/5 to-transparent pointer-events-none" />

            {/* soft mesh */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* sort icon button */}
            <button
              type="button"
              onClick={toggleSortDirection}
              className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-50 via-white to-orange-100 border border-orange-100/80 shadow-[0_4px_12px_rgba(255,77,45,0.08)] shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <BiSortAlt2 className="text-[#ff4d2d] text-sm" />
            </button>

            {/* dropdown */}
            <div className="relative min-w-[210px]">
              {/* glass layer */}
              <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-xl border border-zinc-200/60 shadow-[0_4px_18px_rgba(0,0,0,0.025)] group-hover/main:border-orange-200 transition-all duration-300" />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/main:opacity-100 bg-gradient-to-r from-[#ff4d2d]/5 via-orange-400/5 to-transparent transition-all duration-500 " />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="relative appearance-none bg-transparent w-full h-11 px-4 pr-12 rounded-2xl text-[11px] sm:text-xs font-semibold tracking-wide text-zinc-700 hover:text-zinc-900 outline-none cursor-pointer z-10"
              >
                <option value="newest">Added: Newest First</option>
                <option value="rating">Rating: Highest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
              {/* arrow direction toggle */}
              <button
                type="button"
                onClick={toggleSortDirection}
                title={
                  sortBy === "priceLow" || isAscending
                    ? "Descending"
                    : "Ascending"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-xl bg-zinc-50 hover:bg-orange-50 border border-zinc-100 hover:border-orange-100 shadow-sm cursor-pointer transition-all duration-300 hover:scale-105 active:scale-90"
              >
                <svg
                  className={`w-3 h-3 transition-all duration-300 ease-out 
                    ${
                      sortBy === "priceLow" || isAscending
                        ? "rotate-180 text-orange-500"
                        : "rotate-0 text-zinc-500"
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {/* inner shine */}
              <div className="absolute inset-0 -translate-x-full group-hover/main:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1800ms]" />
            </div>

            {/* outer premium shine */}
            <div className="absolute inset-0 -translate-x-full group-hover/main:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1500ms] ease-out pointer-events-none" />
          </div>
        </div>

        {/* Content States */}
        <AnimatePresence mode="wait">
          {processedItems.length === 0 ? (
            <motion.div
              key={`empty-${activeTab}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-md border border-dashed border-gray-200 hover:border-orange-200/80 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 border border-orange-100/50 text-[#ff4d2d]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>

              <h3 className="font-sans text-base font-semibold text-gray-900 mb-1.5 tracking-tight">
                {activeTab === "All items"
                  ? "Your menu is empty"
                  : `No items in ${activeTab}`}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[260px] mx-auto mb-6 font-normal">
                {activeTab === "All items"
                  ? "Add your first dish to start receiving orders through the platform."
                  : `You haven't listed any dishes under the ${activeTab.toLowerCase()} category yet.`}
              </p>

              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px_12px_rgba(255,77,45,0.08)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate("/add-item")}
                className="inline-flex items-center gap-2 bg-[#ff4d2d] text-white rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer font-sans transition-all duration-200 shadow-sm"
              >
                Add a dish
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${activeTab}-${sortBy}-${isAscending}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 w-full max-w-[1600px]"
            >
              {processedItems.map((item) => (
                <OwnerItemCard data={item} key={item.id ?? item._id} />
              ))}
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
