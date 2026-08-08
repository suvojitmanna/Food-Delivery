import React, { useRef, useState, useEffect, useMemo } from "react";
import Nav from "./Nav";
import { category } from "../category";
import CategoryCard from "./CategoryCard";
import {
  FiChevronLeft,
  FiChevronRight,
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
import { calculateShopsDeliveryMetrics } from "../../utils/location.js";
import { MdOutlineDirectionsBike } from "react-icons/md";

// 1. SCROLL-TRIGGERED VARIANTS
const scrollSectionVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// 2. GRID VARIANTS
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// 3. INDIVIDUAL CARD SPRING VARIANTS
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const UserDashboard = () => {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const { userData } = useSelector((state) => state.user);

  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedLocation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleLocationChanged = (event) => {
      console.log("📍 Navbar location changed:", event.detail);
      setSelectedLocation(event.detail);
    };

    window.addEventListener("locationChanged", handleLocationChanged);

    return () => {
      window.removeEventListener("locationChanged", handleLocationChanged);
    };
  }, []);

  const location = selectedLocation || userState?.city;

  const city =
    location?.city ||
    location?.town ||
    location?.village ||
    location?.municipality ||
    location?.county ||
    location?.state_district ||
    location?.state ||
    "your city";

  const items = userState?.itemsInMyCity || [];
  const rawShops = userState?.shopInMyCity || [];
  const userCoordinates = userData?.location?.coordinates;
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const shops = useMemo(() => {
    return calculateShopsDeliveryMetrics(rawShops, userCoordinates);
  }, [rawShops, userCoordinates]);

  const cards = campaignCards(city);
  const marqueeCards = [...cards, ...cards];
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Top Rated");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // SORT OPTIONS
  const sortOptions = ["Top Rated", "Fast Delivery", "Newest", "A-Z", "Rating"];
  const allCategories = [
    "All",
    ...new Set(
      (shops || []).flatMap(
        (shop) => shop.categories || ["Chinese", "Biryani", "Pizza", "Burgers"],
      ),
    ),
  ];

  let filteredShops =
    selectedCategory === "All"
      ? [...(shops || [])]
      : shops.filter((shop) =>
          (shop.categories || []).includes(selectedCategory),
        );

  switch (selectedSort) {
    case "Top Rated":
    case "Rating":
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
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheelScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 1;
      }
    };

    container.addEventListener("scroll", checkScrollBounds);
    container.addEventListener("wheel", handleWheelScroll, { passive: false });

    checkScrollBounds();

    return () => {
      container.removeEventListener("scroll", checkScrollBounds);
      container.removeEventListener("wheel", handleWheelScroll);
    };
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
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    setTimeout(checkScrollBounds, 300);
  };

  if (!hydrated || !city) return null;

  return (
    <div className="w-full min-h-screen bg-[#faf9f6] flex flex-col items-center antialiased text-slate-800 font-sans pb-24 overflow-x-hidden selection:bg-orange-100 selection:text-orange-600">
      <Nav />

      <main className="w-full max-w-7xl flex flex-col gap-16 px-4 sm:px-8 md:px-12 pt-8 sm:pt-16 select-none">
        {/* HERO EDITORIAL BANNER */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={scrollSectionVariants}
          className="relative overflow-hidden rounded-[40px] border border-stone-200/60 bg-white px-8 py-10 sm:px-14 sm:py-16 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)]"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-100/40 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-50 blur-2xl rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            {/* Left Content */}
            <motion.div variants={cardVariants} className="max-w-3xl">
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
            </motion.div>

            {/* Right Side Sliding Cards */}
            <motion.div
              variants={cardVariants}
              className="relative w-full lg:w-[360px] h-[280px] overflow-hidden"
            >
              <motion.div
                animate={{ y: ["0%", "-50%"] }}
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
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 1: OFFERS */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollSectionVariants}
          className="relative w-full overflow-hidden"
        >
          <motion.div
            variants={cardVariants}
            className="flex flex-col gap-2 mb-8"
          >
            <span className="text-[10px] tracking-[0.35em] text-orange-600 font-black uppercase">
              // Direct Access
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
              The Elite Tier Offers of {city}
            </h2>
          </motion.div>
          <motion.div
            variants={cardVariants}
            animate={{ x: ["0%", "-50%"] }}
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
                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[2px]" />

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

                <div className="relative z-10 flex items-end justify-between gap-5">
                  <p className="text-sm text-white/70 leading-relaxed max-w-[240px]">
                    {card.desc}
                  </p>
                  <button className="whitespace-nowrap bg-white hover:bg-orange-500 text-slate-900 hover:text-white px-5 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 border-none cursor-pointer shadow-lg">
                    {card.button}
                  </button>
                </div>
                <div className="absolute inset-0 rounded-[36px] border border-white/5 pointer-events-none" />
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* SECTION 2: CATEGORY CAROUSEL */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollSectionVariants}
          className="flex flex-col gap-6 items-start w-full"
        >
          <motion.div variants={cardVariants} className="space-y-1">
            <span className="text-[11px] tracking-[0.25em] text-orange-600 font-bold uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-ping" />
              Inspirations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 m-0">
              What's on your mind?
            </h1>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="w-full relative group/track"
          >
            <AnimatePresence>
              {showLeftArrow && (
                <motion.button
                  initial={false}
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
                  initial={false}
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

            <div
              ref={scrollContainerRef}
              className="w-full flex items-center overflow-x-auto gap-6 pb-4 pt-2 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
            >
              {categoryLoading
                ? [...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] md:w-[170px] md:h-[170px] rounded-[26px] overflow-hidden bg-white border border-orange-100 animate-pulse"
                    >
                      <div className="w-full h-full bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
                    </div>
                  ))
                : category.map((cate, index) => (
                    <div key={index}>
                      <CategoryCard data={cate} />
                    </div>
                  ))}
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 3: RESTAURANT LISTS */}
        <section className="flex flex-col gap-16 w-full">
          {/* HEADER */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={scrollSectionVariants}
            className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7"
          >
            <motion.div
              variants={cardVariants}
              className="flex flex-col gap-3 max-w-3xl"
            >
              <span className="w-fit px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[11px] tracking-[0.28em] text-orange-600 font-black uppercase flex items-center gap-2">
                <FiMapPin className="text-sm" />
                Food Discovery Platform
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Restaurants with online food delivery in{" "}
                <span className="text-[#ff4d2d] relative inline-block">
                  {city}
                  <span className="absolute left-0 bottom-1 w-full h-[6px] bg-orange-200/70 rounded-full -z-10" />
                </span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium">
                Discover premium restaurants, lightning-fast delivery and
                trending food experiences near you.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
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

                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-white border border-stone-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                        ref={dropdownRef}
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
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
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
            </motion.div>
          </motion.div>

          {/* MAPPED CATEGORY SECTIONS*/}
          {[
            {
              title: `Top restaurant chains in ${city}`,
              icon: <FiAward />,
              data: [...filteredShops]
                .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
                .slice(0, 8),
            },
            {
              title: `Fast delivery restaurants in ${city}`,
              icon: <FiZap />,
              data: [...filteredShops]
                .sort((a, b) => (a.deliveryTime || 30) - (b.deliveryTime || 30))
                .slice(0, 8),
            },
            {
              title: `Trending restaurants in ${city}`,
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
          ].map((categorySection, sectionIndex) => (
            <RestaurantCategorySection
              key={sectionIndex}
              categorySection={categorySection}
              shops={shops}
              municipality={city}
              navigate={navigate}
            />
          ))}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;

const RestaurantCategorySection = ({
  categorySection,
  shops,
  municipality,
  navigate,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={scrollSectionVariants}
      className="flex flex-col gap-6 sm:gap-8"
    >
      {/* RESPONSIVE HEADER WITH "VIEW ALL" */}
      <motion.div
        variants={cardVariants}
        className="flex flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-600 text-base sm:text-lg">
            {categorySection.icon}
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {categorySection.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block mt-0.5">
              Discover handpicked restaurants & curated dining experiences
            </p>
          </div>
        </div>

        {/* RESPONSIVE VIEW ALL BUTTON */}
        <button
          className="flex-shrink-0 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-bold text-orange-600 hover:text-slate-900 transition-all bg-orange-50 sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-full sm:rounded-none cursor-pointer"
          onClick={() => navigate("/all-restaurants")}
        >
          View All
          <FiArrowRight className="hidden sm:block text-base" />
        </button>
      </motion.div>

      {/* Skeletons show if NOT revealed yet OR shops are empty */}
      {!isRevealed || !shops?.length ? (
        <motion.div
          key={`skeleton-${categorySection.title}`}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pt-0"
        >
          {[...Array(8)].map((_, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/50 shadow-[0_15px_45px_-20px_rgba(0,0,0,0.06)] animate-pulse flex flex-col h-full"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
              <div className="p-5 flex flex-col flex-grow justify-between gap-5">
                <div className="flex gap-2 flex-wrap">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-5 w-16 rounded-lg bg-stone-200" />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-full rounded-xl bg-stone-100" />
                  <div className="h-4 w-4/5 rounded-xl bg-stone-100" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
                  <div className="h-8 w-20 rounded-xl bg-stone-200" />
                  <div className="h-9 w-24 rounded-xl bg-stone-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key={`real-${categorySection.title}`}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pt-0"
        >
          {categorySection.data.map((shop) => (
            <motion.div
              key={shop._id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] transition-shadow duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md rounded-xl px-3 py-1 shadow-sm flex items-center gap-1.5 border border-white/20">
                  <FiStar className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">
                    {shop.rating} |{" "}
                    {shop.totalReviews >= 1000
                      ? `${(shop.totalReviews / 1000).toFixed(1).replace(/\.0$/, "")}k`
                      : shop.totalReviews}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                    {shop.city || municipality}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-1">
                    {shop.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                {/* TOP: Categories & Description */}
                <div className="flex flex-col gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(shop.categories || ["Chinese", "Biryani", "Burgers"])
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

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                    {shop.description ||
                      "Premium handcrafted meals with fast delivery and signature culinary experiences."}
                  </p>
                </div>

                {/* BOTTOM: Metrics & Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col gap-1.5">
                    {shop.distance && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <FiMapPin className="text-orange-400 text-xs" />
                        <span className="text-[11px] font-medium">
                          {shop.distance} away
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MdOutlineDirectionsBike className="text-green-600 text-xs" />
                      <span className="text-xs font-semibold">
                        {shop.deliveryTime} mins
                      </span>
                    </div>
                  </div>

                  <button
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors duration-300 group/btn"
                    onClick={() => navigate(`/menu/${shop._id}`)}
                  >
                    View Menu
                    <FiArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
