import React, { useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "../components/ownerItemCard";
import { BiSortAlt2 } from "react-icons/bi";
import { category } from "../category";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
};

const StatCard = ({ label, value, sub }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white/80 backdrop-blur-md border border-orange-100/60 rounded-2xl p-6 shadow-[0_12px_35px_-12px_rgba(255,77,45,0.06)] hover:shadow-[0_16px_40px_-10px_rgba(255,77,45,0.1)] transition-all duration-300 w-full flex flex-col justify-between"
  >
    <div>
      <p className="text-[10px] tracking-[0.12em] text-orange-600/70 font-bold uppercase mb-3">
        {label}
      </p>
      <p className="font-serif text-3xl sm:text-4xl font-black text-gray-900 leading-none m-0">
        {value}
      </p>
    </div>
    <p className="text-xs text-gray-500 mt-4 m-0 font-normal flex items-center gap-2 bg-gray-50/60 border border-gray-100 rounded-lg px-2.5 py-1 w-fit transition-colors duration-300">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      <span className="tracking-wide">{sub}</span>
    </p>
  </motion.div>
);

const EmptyState = ({ onNavigate }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={containerVariants}
    className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center px-4 max-w-xl mx-auto"
  >
    <motion.div
      variants={fadeUp}
      className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-[11px] tracking-wider text-[#ff4d2d] mb-8 font-bold uppercase shadow-sm shadow-orange-500/5"
    >
      ✦ Restaurant owner portal
    </motion.div>

    <motion.div
      variants={fadeUp}
      className="w-20 h-20 rounded-3xl bg-gradient-to-b from-white to-orange-50/30 border border-orange-100/80 flex items-center justify-center mx-auto mb-8 text-3xl shadow-[0_10px_30px_-10px_rgba(255,77,45,0.1)]"
    >
      🍽️
    </motion.div>

    <motion.h1
      variants={fadeUp}
      className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-gray-900 mb-4"
    >
      List your restaurant{" "}
      <em className="not-italic text-[#ff4d2d] relative inline-block">today</em>
    </motion.h1>

    <motion.p
      variants={fadeUp}
      className="text-sm sm:text-base leading-relaxed text-gray-500 max-w-md mx-auto mb-10 font-normal"
    >
      Join our curated network of culinary partners and bring your kitchen to
      thousands of local food lovers.
    </motion.p>

    <motion.button
      variants={fadeUp}
      whileHover={{ backgroundColor: "#ea3d1d", y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onNavigate("/create-edit-shop")}
      className="inline-flex items-center gap-2 bg-[#ff4d2d] text-white border-none rounded-2xl px-8 py-4 text-xs sm:text-sm font-bold cursor-pointer font-sans shadow-lg shadow-orange-500/20 transition-all duration-300 tracking-wide"
    >
      Add your restaurant →
    </motion.button>
  </motion.div>
);

const Dashboard = ({ shopData, onNavigate }) => {
  const [activeTab, setActiveTab] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("newest");
  const [isAscending, setIsAscending] = useState(false);

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
    if (activeTab !== "All") {
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
      sub: "Tap to manage items",
    },
    {
      label: "AVG RATING",
      value: shopData.rating ?? "—",
      sub: "Based on reviews",
    },
    {
      label: "ORDERS TODAY",
      value: shopData.ordersToday ?? "—",
      sub: "Live updating count",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="w-full max-w-5xl mx-auto flex flex-col gap-8 px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Welcome row */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-orange-100/70"
      >
        <div>
          <p className="text-[10px] tracking-[0.15em] text-orange-600/70 font-bold mb-1.5 uppercase">
            PARTNER DASHBOARD
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-gray-900 m-0">
            Welcome back,{" "}
            <span className="text-[#ff4d2d]">{shopData.name}</span>
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/80 rounded-full px-3.5 py-1.5 text-xs text-emerald-600 font-semibold shadow-sm self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Live on platform
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      {/* Banner card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-orange-100/60 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] group"
      >
        <div className="relative h-56 sm:h-80 overflow-hidden">
          <motion.img
            src={shopData.image}
            alt={shopData.name}
            className="w-full h-full object-cover brightness-[0.7] block"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.15em] font-bold text-orange-300 mb-1.5 uppercase truncate">
                {shopData.city ? shopData.city.toUpperCase() : "ACTIVE"} ·
                PREMIUM PARTNER
              </p>
              <h2 className="font-serif text-2xl sm:text-4xl font-black tracking-tight text-white m-0 truncate">
                {shopData.name}
              </h2>
            </div>
            <motion.button
              whileHover={{
                backgroundColor: "#ff4d2d",
                borderColor: "#ff4d2d",
                color: "#ffffff",
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("/create-edit-shop")}
              aria-label="Edit restaurant"
              className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/60 flex items-center justify-center cursor-pointer text-gray-800 flex-shrink-0 text-sm shadow-md transition-all duration-300"
            >
              ✏
            </motion.button>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 flex items-center justify-between border-t border-gray-50 bg-white">
          <div className="min-w-0">
            <p className="text-[9px] tracking-widest text-gray-400 font-bold m-0 uppercase">
              RESTAURANT ADDRESS
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-normal mt-1 m-0 break-words">
              {shopData.address}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Menu section Header & Sort integrated row */}
      <motion.div variants={itemVariants} className="pb-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] tracking-[0.15em] text-orange-600/70 font-bold uppercase select-none">
              MENU MANAGEMENT
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
              Explore Categories
            </h2>
          </div>

          {/* Premium UI Sort Dropdown Selector */}
          <div className="group/main relative flex items-center gap-2.5 self-stretch sm:self-auto h-12 px-3.5 rounded-2xl border border-gray-200/70 bg-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 select-none">
            <button
              type="button"
              onClick={toggleSortDirection}
              className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 border border-orange-100/50 text-[#ff4d2d] shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <BiSortAlt2 className="text-base" />
            </button>

            <div className="relative flex-1 sm:flex-none min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent w-full h-9 pl-1 pr-8 rounded-xl text-xs font-bold tracking-wide text-gray-700 hover:text-gray-950 outline-none cursor-pointer z-10 border-none"
              >
                <option value="newest">Added: Newest First</option>
                <option value="rating">Rating: Highest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
              <button
                type="button"
                onClick={toggleSortDirection}
                title={
                  sortBy === "priceLow" || isAscending
                    ? "Descending"
                    : "Ascending"
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 shadow-sm cursor-pointer transition-all duration-200"
              >
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ease-out ${
                    sortBy === "priceLow" || isAscending
                      ? "rotate-180 text-orange-500"
                      : "rotate-0 text-gray-500"
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
            </div>
          </div>
        </div>

        {/* MODERN GRID CATEGORY TAP UI LIST */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          {category.map((t) => {
            const isActive = activeTab === t.category;

            return (
              <button
                key={t.category}
                type="button"
                onClick={() => setActiveTab(t.category)}
                className={`group/btn relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 select-none cursor-pointer outline-none ${
                  isActive
                    ? "bg-gradient-to-b from-orange-50/60 to-orange-100/20 border-[#ff4d2d] shadow-md shadow-orange-500/5 scale-[1.02]"
                    : "bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/5 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-300 pointer-events-none ${
                    isActive
                      ? "border-[#ff4d2d] bg-white scale-105 shadow-sm"
                      : "border-gray-100 bg-gray-50 group-hover/btn:scale-105 group-hover/btn:border-orange-200"
                  }`}
                >
                  <img
                    src={t.image}
                    alt={t.category}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/btn:scale-105"
                  />
                </div>

                <span
                  className={`text-xs mt-3 font-semibold tracking-wide transition-colors duration-200 text-center pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 ${
                    isActive
                      ? "text-gray-900 font-bold"
                      : "text-gray-500 group-hover/btn:text-gray-800"
                  }`}
                >
                  {t.category}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderlineIndicator"
                    className="absolute bottom-1.5 w-6 h-1 bg-[#ff4d2d] rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
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
              className="bg-gradient-to-b from-white to-gray-50/40 backdrop-blur-md border border-dashed border-gray-200 hover:border-orange-200/80 rounded-2xl p-10 sm:p-16 text-center flex flex-col items-center shadow-sm transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 border border-orange-100/50 text-[#ff4d2d]">
                <svg
                  className="w-6 h-6"
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

              <h3 className="font-sans text-base font-bold text-gray-900 mb-2 tracking-tight">
                {activeTab === "All"
                  ? "Your menu is empty"
                  : `No items in ${activeTab}`}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm mx-auto mb-8 font-normal">
                {activeTab === "All"
                  ? "Add your first dish to start receiving orders through the platform."
                  : `You haven't listed any dishes under the ${activeTab.toLowerCase()} category yet.`}
              </p>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#ea3d1d" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate("/add-item")}
                className="inline-flex items-center gap-2 bg-[#ff4d2d] text-white border-none rounded-xl px-6 py-3 text-xs font-bold cursor-pointer font-sans transition-all duration-200 shadow-md shadow-orange-500/10"
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
              className="grid grid-cols-1 gap-4 w-full"
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
      <div className="w-full min-h-screen bg-gradient-to-b from-[#fffbf9] to-[#fff6f1] flex flex-col items-center antialiased text-gray-800 font-sans pb-12">
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
