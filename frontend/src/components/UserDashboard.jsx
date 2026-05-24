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
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { campaignCards } from "./offerCard.js";

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

  const userState = useSelector((state) => state.user);
  const city = userState?.city?.city || userState?.city || "your city";
  const municipality = userState?.city?.municipality || "your city";
  if (!city) return null;
  const shops = userState?.shopInMyCity || [];
  const cards = campaignCards(city);

  // duplicate for infinite slider
  const marqueeCards = [...cards, ...cards];

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
        <section className="flex flex-col gap-8 w-full">
          <motion.div
            variants={itemFadeVariants}
            className="flex flex-col gap-1.5"
          >
            <span className="text-[11px] tracking-[0.25em] text-orange-600 font-bold uppercase flex items-center gap-1.5">
              <FiMapPin className="text-xs" /> Gastronomy Hub
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 m-0">
              Popular dining destinations in{" "}
              <span className="text-[#ff4d2d] underline ">{municipality}</span>
            </h2>
          </motion.div>

          {/* Grid Layout Controller */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.length > 0
              ? shops.map((shop) => (
                  <motion.div
                    key={shop._id}
                    variants={itemFadeVariants}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-[32px] overflow-hidden border border-stone-200/50 shadow-[0_15px_45px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(234,88,12,0.12)] hover:border-orange-100 transition-all duration-500 cursor-pointer flex flex-col justify-between h-full"
                  >
                    {/* Card Media Wrapper */}
                    <div className="relative h-[240px] overflow-hidden">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Dark Elegant Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                      {/* Float Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-md border border-white flex items-center gap-1">
                        <FiStar className="text-amber-500 text-xs fill-amber-500" />
                        <span className="text-xs font-black text-slate-900">
                          {shop.rating || "4.5"}
                        </span>
                      </div>

                      {/* Bottom Metadata inside Image */}
                      <div className="absolute bottom-5 left-6 right-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-extrabold block mb-1">
                          {shop.city || city}
                        </span>
                        <h3 className="text-2xl font-serif font-black text-white leading-tight m-0">
                          {shop.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Info Content */}
                    <div className="p-6 flex flex-col justify-between flex-grow gap-5">
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-normal m-0">
                        {shop.description ||
                          "Indulge in artisanal culinary items and unique menus sourced directly from regional creators."}
                      </p>

                      <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100/80">
                          <FiClock className="text-xs text-orange-500" />
                          <span className="text-xs font-bold">
                            {shop.deliveryTime || 30} mins
                          </span>
                        </div>

                        <button className="relative overflow-hidden group/btn bg-slate-900 hover:bg-orange-600 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 shadow-sm flex items-center gap-1.5 border-none cursor-pointer">
                          <span>View Menu</span>
                          <FiArrowRight className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              : Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-white rounded-[32px] border border-stone-200/40 p-5 space-y-5 animate-pulse"
                  >
                    <div className="w-full h-48 bg-stone-100 rounded-[24px]" />
                    <div className="space-y-3 px-2">
                      <div className="w-1/3 h-3.5 bg-stone-100 rounded-full" />
                      <div className="w-3/4 h-6 bg-stone-200 rounded-full" />
                      <div className="w-full h-4 bg-stone-100 rounded-full" />
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </motion.main>
    </div>
  );
};

export default UserDashboard;
