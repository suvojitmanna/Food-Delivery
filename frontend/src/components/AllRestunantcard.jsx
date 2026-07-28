import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaClock, FaHeart, FaSearch } from "react-icons/fa";
import {
  FiFilter,
  FiGrid,
  FiTrendingUp,
  FiZap,
  FiAward,
  FiMic,
  FiArrowLeft,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import { MdOutlineDirectionsBike } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { calculateShopsDeliveryMetrics } from "../../utils/location";

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
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const { userData } = useSelector((state) => state.user);
  const municipality = userState?.city?.municipality || "your city";

  const rawShops = userState?.shopInMyCity || [];
  const userCoordinates = userData?.location?.coordinates;

  // 1. Properly calculate metrics for all shops FIRST
  const shops = useMemo(() => {
    return calculateShopsDeliveryMetrics(rawShops, userCoordinates);
  }, [rawShops, userCoordinates]);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isListening, setIsListening] = useState(false);

  // NEW: Loading State
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Mouse Drag Scrolling States
  const filterScrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Initialize favorites from Local Storage
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavs = localStorage.getItem("userFavorites");
      return savedFavs ? JSON.parse(savedFavs) : {};
    } catch (error) {
      console.error("Error reading favorites from local storage", error);
      return {};
    }
  });

  const recognitionRef = useRef(null);

  // Handle Loading Simulation/Resolution
  useEffect(() => {
    if (shops.length > 0) {
      setIsLoading(false);
    } else {
      // Fallback timeout to stop showing skeleton if no data exists
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [shops]);

  // Save favorites to Local Storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("userFavorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to local storage", error);
    }
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
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
    if (!recognitionRef.current) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSearch("");
      recognitionRef.current.start();
    }
  };

  // NEW: Mouse Drag Scrolling Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - filterScrollRef.current.offsetLeft);
    setScrollLeft(filterScrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - filterScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed multiplier
    filterScrollRef.current.scrollLeft = scrollLeft - walk;
  };

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
    <div className="min-h-screen bg-[#faf9f6] px-4 sm:px-6 lg:px-12 py-8 antialiased">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 md:p-14 text-white mb-12 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4 relative z-20">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md shadow-lg flex shrink-0 items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <FiArrowLeft className="text-lg sm:text-xl" />
          </button>

          {/* PREMIUM BADGE */}
          <span className="px-4 py-1.5 sm:py-2 rounded-full bg-white/10 border border-white/10 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-orange-400 backdrop-blur-md whitespace-nowrap shadow-sm">
            Premium Food Discovery
          </span>
        </div>

        {/* BACKGROUND GLOW */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />

        {/* MAIN CONTENT WRAPPER*/}
        <div className="relative z-10 flex flex-col gap-6 max-w-4xl mt-8 md:mt-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Explore the best <br className="hidden sm:inline" />
            restaurants in{" "}
            <span className="text-orange-400">{municipality}</span>
          </h1>

          <p className="text-slate-300 max-w-xl text-base md:text-lg leading-relaxed font-normal">
            Discover premium dining experiences, lightning-fast delivery,
            trending cafés, and handpicked local favorites.
          </p>

          {/* SEARCH BAR WITH VOICE TYPING */}
          <div className="relative w-full max-w-xl mt-2 group flex items-center">
            <FaSearch className="absolute left-5 text-slate-400 transition-colors group-focus-within:text-orange-500 z-10" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 rounded-2xl bg-white text-slate-900 pl-14 pr-16 outline-none transition-all duration-300 focus:ring-4 focus:ring-orange-500/20 shadow-lg font-medium placeholder:text-slate-400"
            />
            <button
              onClick={toggleListening}
              className={`absolute right-3 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center z-10 ${
                isListening
                  ? "bg-orange-100 text-orange-600"
                  : "text-slate-400 hover:text-orange-500 hover:bg-slate-50"
              }`}
            >
              <FiMic
                className={`text-lg ${isListening ? "animate-pulse scale-110" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div
          ref={filterScrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-2.5 overflow-x-auto pb-2 -mb-2 scrollbar-none snap-x mask-gradient transition-all ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          {FILTER_OPTIONS.map((filter, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isDragging) setActiveFilter(filter);
              }}
              className={`whitespace-nowrap px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 snap-center ${
                isDragging ? "pointer-events-none" : ""
              }
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
          <span>
            {isLoading ? "..." : filteredRestaurants.length} Restaurants Found
          </span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
        <AnimatePresence mode="popLayout">
          {isLoading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <SkeletonCard key={`skeleton-${idx}`} />
              ))
            : filteredRestaurants.map((shop, index) => (
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
      {!isLoading && filteredRestaurants.length === 0 && (
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

/* NEW: SKELETON LOADING CARD SUB-COMPONENT */
const SkeletonCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full animate-pulse"
    >
      <div className="h-52 bg-slate-200 shrink-0 w-full"></div>
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div className="flex flex-col gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-slate-200 rounded-lg"></div>
            <div className="h-5 w-16 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-4 w-full bg-slate-200 rounded mt-2"></div>
          <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 bg-slate-200 rounded"></div>
            <div className="h-3 w-12 bg-slate-200 rounded"></div>
          </div>
          <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </motion.div>
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

  // TIME & DISTANCE LOGIC
  // 1. Parse the string (e.g. "0 m" -> 0, "2.5 km" -> 2.5)
  const distanceNumber = parseFloat(shop.distance);
  // 2. Check if it's effectively 0 distance
  const isZeroDistance = shop.distance && distanceNumber === 0;

  // 3. Setup Fallback numbers
  const prepTime = shop.preparationTime || 15;
  const baseDeliveryTime = shop.deliveryTime || 30;

  // 4. Calculate Final Display Time
  const displayTime = isZeroDistance
    ? prepTime + baseDeliveryTime
    : baseDeliveryTime;

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
      <div
        className="relative h-52 overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
        onClick={() => navigate(`/menu/${shop._id}`)}
      >
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
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <FaHeart
            className={`text-sm transition-colors ${isFavorite ? "text-red-500" : "text-slate-500 hover:text-red-400"}`}
          />
        </button>

        {/* RATING & REVIEWS */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
          <FaStar className="text-amber-500 text-xs" />
          <span className="font-bold text-xs text-slate-800">
            {shop.rating || "4.5"}
          </span>
          <span className="text-[10px] text-slate-500 font-medium border-l border-slate-300 pl-1.5">
            {shop.totalReviews >= 1000
              ? `${(shop.totalReviews / 1000).toFixed(1).replace(/\.0$/, "")}k`
              : shop.totalReviews}
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
              <span className="text-xs font-semibold">{displayTime} mins</span>
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
  );
};

export default AllRestaurantCard;
