import React, { useRef, useState, useEffect } from "react";
import Nav from "./Nav";
import { category } from "../category";
import CategoryCard from "./CategoryCard";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiStar,
  FiArrowRight,
  FiMapPin,
  FiFilter,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiDollarSign,
  FiMoon,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { campaignCards } from "./offerCard.js";
import { useNavigate } from "react-router-dom";
const dashboardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemFadeVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const UserDashboard = () => {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const city = userState?.city?.city || userState?.city || "your city";
  const municipality = userState?.city?.municipality || "your city";
  if (!city) return null;
  const shops = userState?.shopInMyCity || [];
  const cards = campaignCards(city);
  const marqueeCards = [...cards, ...cards];
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Top Rated");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  // ================= SORT OPTIONS =================
  const sortOptions = [
    "Top Rated",
    "Fast Delivery",
    "Newest",
    "A-Z",
    "Ratting",
  ];

  const allCategories = [
    "All",
    ...new Set(
      shops.flatMap(
        (shop) => shop.categories || ["Chinese", "Biryani", "Pizza", "Burgers"],
      ),
    ),
  ];
  let filteredShops =
    selectedCategory === "All"
      ? [...shops]
      : shops.filter((shop) =>
          (shop.categories || []).includes(selectedCategory),
        );

  switch (selectedSort) {
    case "Top Rated":
      filteredShops.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
      break;

    case "Fast Delivery":
      filteredShops.sort(
        (a, b) => (a.deliveryTime || 30) - (b.deliveryTime || 30),
      );
      break;

    case "A-Z":
      filteredShops.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "Newest":
      filteredShops.reverse();
      break;

    default:
      break;
  }

  const checkScrollBounds = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheelScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 1.2;
      }
    };

    container.addEventListener("scroll", checkScrollBounds);
    container.addEventListener("wheel", handleWheelScroll, { passive: false });

    // Core Layout Recalculation Boundary
    checkScrollBounds();

    return () => {
      container.removeEventListener("scroll", checkScrollBounds);
      container.removeEventListener("wheel", handleWheelScroll);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;

      scrollContainerRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#faf9f6] flex flex-col items-center antialiased text-slate-800 font-sans pb-24 overflow-x-hidden selection:bg-orange-100 selection:text-orange-600">
      <Nav />

      <motion.main
        variants={dashboardVariants}
        animate="show"
        className="w-full max-w-7xl flex flex-col gap-16 px-4 sm:px-8 md:px-12 pt-8 sm:pt-16 select-none"
      >
        {/* ================= HERO EDITORIAL BANNER ================= */}
        <motion.section
          variants={itemFadeVariants}
          className="relative overflow-hidden rounded-[40px] border border-stone-200/60 bg-white px-8 py-10 sm:px-14 sm:py-16 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)]"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-100/40 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-50 blur-2xl rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            {/* Left Content */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-[10px] tracking-[0.18em] uppercase font-bold text-stone-600 m-0">
                  Premium Local Discovery
                </p>
              </div>

              <h2 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.05] capitalize">
                Find trending food & <br className="hidden sm:inline" />
                lifestyle spots in{" "}
                <span className="text-orange-500 relative inline-block">
                  {city}
                  <span className="absolute left-0 bottom-1 w-full h-[6px] bg-orange-100 rounded-full -z-10" />
                </span>
              </h2>

              <p className="mt-5 text-slate-500 leading-relaxed text-base max-w-xl">
                Explore curated restaurants, premium cafés, trending offers, and
                exclusive seasonal experiences selected for your city.
              </p>

              {/* CTA */}
              <div className="mt-7 flex flex-wrap gap-4">
                <button className="px-7 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-200 transition-all duration-300">
                  Explore Now
                </button>

                <button className="px-7 py-3 rounded-2xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700 font-semibold transition-all duration-300">
                  View Trending
                </button>
              </div>
            </div>

            {/* Right Side Sliding Cards */}
            <div className="relative w-full lg:w-[360px] h-[280px] overflow-hidden">
              <motion.div
                animate={{
                  y: ["0%", "-50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex flex-col gap-4"
              >
                {[
                  {
                    title: "50% OFF Weekend Deals",
                    desc: "Limited-time premium dining offers near you.",
                    icon: "🎉",
                  },
                  {
                    title: "Top Rated Cafés",
                    desc: "Discover aesthetic & trending café spaces.",
                    icon: "☕",
                  },
                  {
                    title: "Fast Delivery Partners",
                    desc: "Lightning-fast service from trusted shops.",
                    icon: "⚡",
                  },
                  {
                    title: "Luxury Dining Picks",
                    desc: "Handpicked gourmet experiences in your city.",
                    icon: "🍽️",
                  },
                ]
                  .concat([
                    {
                      title: "50% OFF Weekend Deals",
                      desc: "Limited-time premium dining offers near you.",
                      icon: "🎉",
                    },
                    {
                      title: "Top Rated Cafés",
                      desc: "Discover aesthetic & trending café spaces.",
                      icon: "☕",
                    },
                  ])
                  .map((card, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">
                          {card.icon}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-800 mb-1">
                            {card.title}
                          </h3>

                          <p className="text-sm text-slate-500 leading-relaxed">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ================= SECTION 1: CATEGORY CAROUSEL ================= */}

        <motion.section className="flex flex-col gap-6 items-start w-full">
          <motion.div variants={itemFadeVariants} className="space-y-1">
            <span className="text-[11px] tracking-[0.25em] text-orange-600 font-bold uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-ping" />
              Inspirations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 m-0">
              What's on your mind?
            </h1>
          </motion.div>

          <motion.div
            variants={itemFadeVariants}
            className="w-full relative group/track"
          >
            {/* Carousel Navigation Arrows */}
            <AnimatePresence>
              {showLeftArrow && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, x: -5 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleScroll("left")}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center justify-center cursor-pointer text-slate-700 hover:text-orange-500 hover:border-orange-100 transition-colors hidden md:flex"
                >
                  <FiChevronLeft className="text-xl stroke-[2.5]" />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showRightArrow && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, x: 5 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleScroll("right")}
                  className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center justify-center cursor-pointer text-slate-700 hover:text-orange-500 hover:border-orange-100 transition-colors hidden md:flex"
                >
                  <FiChevronRight className="text-xl stroke-[2.5]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Carousel Scroll Track */}
            <div
              ref={scrollContainerRef}
              className="w-full flex items-center overflow-x-auto gap-6 pb-4 pt-2 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
            >
              {category.map((cate, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]"
                >
                  <CategoryCard data={cate} />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ================= SECTION 2: MARKETING & PROMO GRID ================= */}

        <motion.section
          variants={itemFadeVariants}
          className="relative w-full overflow-hidden"
        >
          <motion.div
            variants={itemFadeVariants}
            className="flex flex-col gap-2 mb-8"
          >
            <span className="text-[10px] tracking-[0.35em] text-orange-600 font-black uppercase">
              // Direct Access
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
              The Elite Tier Offers of {municipality}
            </h2>
          </motion.div>
          <motion.div
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 50,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-6 w-max"
          >
            {marqueeCards.map((card, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-[36px] bg-gradient-to-br ${card.gradient} p-8 sm:p-10 text-white flex flex-col justify-between h-[260px] min-w-[360px] sm:min-w-[430px] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] group`}
              >
                {/* Glow */}
                <div
                  className={`absolute right-0 bottom-0 translate-x-8 translate-y-8 w-52 h-52 ${card.glow} blur-3xl rounded-full group-hover:scale-125 transition-transform duration-700`}
                />

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[2px]" />

                {/* Top */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-[0.25em] uppercase font-extrabold text-orange-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-300 animate-pulse" />
                      {card.subtitle}
                    </span>

                    <h3 className="font-serif text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      {card.title}
                    </h3>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center justify-center text-3xl shadow-inner">
                    {card.icon}
                  </div>
                </div>

                {/* Bottom */}
                <div className="relative z-10 flex items-end justify-between gap-5">
                  <p className="text-sm text-white/70 leading-relaxed max-w-[240px]">
                    {card.desc}
                  </p>

                  <button className="whitespace-nowrap bg-white hover:bg-orange-500 text-slate-900 hover:text-white px-5 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 border-none cursor-pointer shadow-lg">
                    {card.button}
                  </button>
                </div>

                {/* Border */}
                <div className="absolute inset-0 rounded-[36px] border border-white/5 pointer-events-none" />
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* ================= SECTION 3: RESTAURANT DYNAMIC LISTING ================= */}

        <section className="flex flex-col gap-16 w-full">
          {/* ================= HEADER ================= */}
          <motion.div
            variants={itemFadeVariants}
            className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7"
          >
            {/* LEFT CONTENT */}
            <div className="flex flex-col gap-3 max-w-3xl">
              <span className="w-fit px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[11px] tracking-[0.28em] text-orange-600 font-black uppercase flex items-center gap-2">
                <FiMapPin className="text-sm" />
                Food Discovery Platform
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Restaurants with online food delivery in{" "}
                <span className="text-[#ff4d2d] relative inline-block">
                  {municipality}
                  <span className="absolute left-0 bottom-1 w-full h-[6px] bg-orange-200/70 rounded-full -z-10" />
                </span>
              </h2>

              <p className="text-slate-500 text-sm sm:text-base font-medium">
                Discover premium restaurants, lightning-fast delivery and
                trending food experiences near you.
              </p>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex flex-col gap-4">
              {/* FILTERS */}
              <div className="flex flex-wrap gap-3">
                {/* SORT BUTTON */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 shadow-lg"
                  >
                    <FiFilter />
                    {selectedSort}
                    <FiChevronDown
                      className={`transition-transform duration-300 ${
                        showSortDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* DROPDOWN */}
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-white border border-stone-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-50"ref={dropdownRef}
                      >
                        <div className="p-3">
                          <div className="px-3 py-2">
                            <h4 className="text-sm font-black text-slate-900">
                              Sort Restaurants
                            </h4>

                            <p className="text-xs text-slate-500 mt-1">
                              Choose your preferred sorting
                            </p>
                          </div>

                          <div className="mt-2 flex flex-col gap-1">
                            {sortOptions.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedSort(option);
                                  setShowSortDropdown(false);
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer
                        ${
                          selectedSort === option
                            ? "bg-orange-50 text-orange-600"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                              >
                                {option}

                                {selectedSort === option && (
                                  <FiCheck className="text-base" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= CATEGORY LIST ================= */}
          {[
            {
              title: `Top restaurant chains in ${municipality}`,
              icon: <FiAward />,
              data: [...filteredShops]
                .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
                .slice(0, 8),
            },

            {
              title: `Fast delivery restaurants in ${municipality}`,
              icon: <FiZap />,
              data: [...filteredShops]
                .sort((a, b) => (a.deliveryTime || 30) - (b.deliveryTime || 30))
                .slice(0, 8),
            },

            {
              title: `Trending restaurants in ${municipality}`,
              icon: <FiTrendingUp />,
              data: [...filteredShops].slice(0, 8),
            },

            {
              title: `Luxury dining & premium brands`,
              icon: <FiStar />,
              data: [...filteredShops]
                .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
                .slice(0, 8),
            },

            {
              title: `Best budget-friendly restaurants`,
              icon: <FiDollarSign />,
              data: [...filteredShops].slice(0, 8),
            },

            {
              title: `Late night delivery spots`,
              icon: <FiMoon />,
              data: [...filteredShops].slice(0, 8),
            },
          ].map((category, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              variants={itemFadeVariants}
              className="flex flex-col gap-8"
            >
              {/* SECTION HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-lg">
                    {category.icon}
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {category.title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Discover handpicked restaurants & curated dining
                      experiences
                    </p>
                  </div>
                </div>

                <button
                  className="hidden sm:flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-slate-900 transition-all"
                  onClick={() => navigate("/all-restaurants")}
                >
                  View All
                  <FiArrowRight />
                </button>
              </div>

              {/* RESTAURANT GRID */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[32px] overflow-hidden border border-stone-200/50 shadow-[0_15px_45px_-20px_rgba(0,0,0,0.06)] animate-pulse"
                    >
                      {/* IMAGE SKELETON */}
                      <div className="h-[230px] bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />

                      {/* CONTENT */}
                      <div className="p-6 flex flex-col gap-5">
                        {/* CATEGORY */}
                        <div className="flex gap-2 flex-wrap">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-7 w-20 rounded-full bg-stone-200"
                            />
                          ))}
                        </div>

                        {/* TITLE */}
                        <div className="flex flex-col gap-3">
                          <div className="h-5 w-3/4 rounded-xl bg-stone-200" />

                          <div className="h-4 w-full rounded-xl bg-stone-100" />

                          <div className="h-4 w-5/6 rounded-xl bg-stone-100" />
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                          <div className="h-10 w-24 rounded-2xl bg-stone-200" />

                          <div className="h-11 w-28 rounded-2xl bg-stone-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                  {category.data.map((shop) => (
                    <motion.div
                      key={shop._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      whileHover={{ y: -6 }}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img
                          src={shop.image}
                          alt={shop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />

                        {/* SOFT GRADIENT SCRIM */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                        {/* RATING */}
                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md rounded-xl px-2.5 py-1 shadow-sm flex items-center gap-1 border border-white/20">
                          <FiStar className="text-amber-500 fill-amber-500 text-xs" />
                          <span className="text-xs font-bold text-slate-800">
                            {shop.rating || "4.5"}
                          </span>
                        </div>

                        {/* BOTTOM INFO */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                            {shop.city || municipality}
                          </span>

                          <h3 className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-1">
                            {shop.name}
                          </h3>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                        <div className="space-y-3">
                          {/* CATEGORIES */}
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              shop.categories || [
                                "Chinese",
                                "Biryani",
                                "Burgers",
                              ]
                            )
                              .slice(0, 3)
                              .map((cat, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-100"
                                >
                                  {cat}
                                </span>
                              ))}
                          </div>

                          {/* DESCRIPTION */}
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                            {shop.description ||
                              "Premium handcrafted meals with fast delivery and signature culinary experiences."}
                          </p>
                        </div>

                        {/* DELIVERY & CTA */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <FiClock className="text-slate-400 text-xs" />
                            <span className="text-xs font-semibold">
                              {shop.deliveryTime || 30} mins
                            </span>
                          </div>

                          <button className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors duration-300 group/btn" onClick={() => navigate(`/menu/${shop._id}`)}>
                            View Menu
                            <FiArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </section>
      </motion.main>
    </div>
  );
};

export default UserDashboard;
