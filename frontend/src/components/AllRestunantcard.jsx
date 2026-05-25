import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaClock,
  FaMotorcycle,
  FaHeart,
  FaSearch,
} from "react-icons/fa";
import { FiFilter, FiGrid, FiTrendingUp, FiZap, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const FILTER_OPTIONS = [
  "All",
  "Top Rated",
  "Fast Delivery",
  "Trending",
  "Luxury Dining",
  "Budget Friendly",
];

const CATEGORY_STRIP = [
  { icon: <FiAward />, title: "Top Rated", desc: "Premium restaurants" },
  { icon: <FiZap />, title: "Fast Delivery", desc: "Quickest delivery spots" },
  { icon: <FiTrendingUp />, title: "Trending", desc: "Most popular this week" },
  { icon: <FiFilter />, title: "Curated", desc: "Handpicked experiences" },
];

const AllRestaurantCard = () => {
  const userState = useSelector((state) => state.user);
  const municipality = userState?.city?.municipality || "your city";
  const shops = userState?.shopInMyCity || [];
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  console.log(shops);
  // FILTER & SEARCH LOGIC
  const filteredRestaurants = useMemo(() => {
    let data = [...shops];

    if (search.trim()) {
      data = data.filter((shop) =>
        shop.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    switch (activeFilter) {
      case "Top Rated":
        return data.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
      case "Fast Delivery":
        return data.sort(
          (a, b) => (a.deliveryTime || 30) - (b.deliveryTime || 30),
        );
      case "Trending":
        return [...data].reverse();
      case "Luxury Dining":
        return data.filter((shop) => (shop.rating || 4.5) >= 4.5);
      case "Budget Friendly":
        return data.filter(
          (shop) =>
            shop.priceRange === "Budget" || shop.priceRange === "Affordable",
        );
      default:
        return data;
    }
  }, [shops, search, activeFilter]);

  return (
    <div className="min-h-screen bg-[#faf9f6] px-4 sm:px-6 lg:px-12 py-10 antialiased">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 md:p-14 text-white mb-12 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
          <span className="w-fit px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] tracking-[0.2em] uppercase font-bold text-orange-400">
            Premium Food Discovery
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Explore the best <br className="hidden sm:inline" />
            restaurants in{" "}
            <span className="text-orange-400">{municipality}</span>
          </h1>

          <p className="text-slate-300 max-w-xl text-base md:text-lg leading-relaxed font-normal">
            Discover premium dining experiences, lightning-fast delivery,
            trending cafés, and handpicked local favorites.
          </p>

          {/* SEARCH BAR */}
          <div className="relative w-full max-w-xl mt-4 group">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-5 text-slate-400 transition-colors group-focus-within:text-orange-500" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 rounded-2xl bg-white text-slate-900 pl-14 pr-5 outline-none transition-all duration-300 focus:ring-4 focus:ring-orange-500/20 shadow-lg font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mb-2 scrollbar-none snap-x mask-gradient">
          {FILTER_OPTIONS.map((filter, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 snap-center
              ${
                activeFilter === filter
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <FiGrid className="text-sm" />
          <span>{filteredRestaurants.length} Restaurants Found</span>
        </div>
      </div>

      {/* MARKETING STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {CATEGORY_STRIP.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RESTAURANT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRestaurants.map((shop, index) => (
            <RestaurantCard
              key={shop._id || index}
              shop={shop}
              index={index}
              municipality={municipality}
              isFavorite={!!favorites[shop._id || index]}
              onToggleFavorite={() => toggleFavorite(shop._id || index)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* EMPTY STATE */}
      {filteredRestaurants.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 text-xl">
            <FiFilter />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            No restaurants match
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            We couldn't find anything matching your filters. Try adjusting your
            search query or criteria.
          </p>
        </motion.div>
      )}
    </div>
  );
};

/* EXTRACTED CARD SUB-COMPONENT */
const RestaurantCard = ({
  shop,
  index,
  municipality,
  isFavorite,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        opacity: { duration: 0.2 },
        layout: { type: "spring", stiffness: 500, damping: 40 },
      }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* IMAGE MEDIA COVER */}
      <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={
            shop.image ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60"
          }
          alt={shop.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* TOP LEVEL FLOATING BADGES */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <FaHeart
            className={`text-sm transition-colors ${isFavorite ? "text-red-500" : "text-slate-600"}`}
          />
        </button>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
          <FaStar className="text-amber-500 text-xs" />
          <span className="font-bold text-xs text-slate-800">
            {shop.rating || "4.5"}
          </span>
        </div>

        {/* GEOLOCATION TEXTS */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-[9px] uppercase tracking-wider text-orange-400 font-bold">
            {shop.city || municipality}
          </span>
          <h2 className="text-xl font-bold tracking-tight mt-0.5 line-clamp-1">
            {shop.name}
          </h2>
        </div>
      </div>

      {/* METADATA WRAPPERS */}
      <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(shop.categories || ["Cafe", "Dinner"])
              .slice(0, 3)
              .map((cat, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-semibold tracking-wide border border-slate-100"
                >
                  {cat}
                </span>
              ))}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {shop.description ||
              "Premium handcrafted meals showcasing exclusive local culinary expertise and swift handling."}
          </p>
        </div>

        {/* BOTTOM METRICS */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <FaClock className="text-orange-500/80" />
              <span>{shop.deliveryTime || 30}m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaMotorcycle className="text-orange-500/80" />
              <span>Free</span>
            </div>
          </div>

          <button
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold tracking-wide transition-all duration-300 shadow-sm"
            onClick={() => navigate(`/menu/${shop._id}`)}
          >
            View Menu
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AllRestaurantCard;
