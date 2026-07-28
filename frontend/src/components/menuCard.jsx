import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import {
  FiX,
  FiArrowLeft,
  FiSearch,
  FiClock,
  FiMapPin,
  FiShare2,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/cartSlice";

const MenuCard = () => {
  const { id, shopId } = useParams();
  const modalRef = useRef();
  const [expandedItem, setExpandedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // NEW: Filter States
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const carts = useSelector((state) => state.cart.carts);
  const { itemsInMyCity, shopInMyCity, loading } = useSelector(
    (state) => state.user,
  );

  const shop = shopInMyCity?.find((item) => item._id === (id || shopId));

  const rawFilteredItems = itemsInMyCity?.filter(
    (item) => item.shop && item.shop._id.toString() === shop?._id?.toString(),
  );

  // Derive unique categories dynamically from the menu items
  const categories = useMemo(() => {
    const cats =
      rawFilteredItems?.map((item) => item.category).filter(Boolean) || [];
    return ["All", ...new Set(cats)];
  }, [rawFilteredItems]);

  // Apply Search, Veg/Non-Veg, and Category Filters
  const displayItems = useMemo(() => {
    return rawFilteredItems?.filter((item) => {
      // Veg / Non-Veg Logic
      if (vegOnly && item.type?.toLowerCase() !== "veg") return false;
      if (nonVegOnly && item.type?.toLowerCase() === "veg") return false;

      // Category Logic
      if (activeCategory !== "All" && item.category !== activeCategory)
        return false;

      // Search Logic
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rawFilteredItems, vegOnly, nonVegOnly, activeCategory, searchQuery]);

  const currentShopCart = carts[shop?._id] || { items: {} };
  const cartCount = currentShopCart.items;

  const totalItems = Object.values(cartCount).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalPrice = Object.values(cartCount).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedItem(null);
      }
    };

    if (selectedItem) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [selectedItem]);

  const handleAdd = (item) => {
    dispatch(addToCart(item));
  };

  const handleVegToggle = () => {
    setVegOnly(!vegOnly);
    if (!vegOnly) setNonVegOnly(false); // Turn off non-veg if veg is turned on
  };

  const handleNonVegToggle = () => {
    setNonVegOnly(!nonVegOnly);
    if (!nonVegOnly) setVegOnly(false); // Turn off veg if non-veg is turned on
  };

  // Zomato Brand Colors
  const ZOMATO_RED = "#E23744";
  const VEG_GREEN = "#1D8F24";
  const RATING_GREEN = "#24963F";

  // SKELETON LOADER (Matched to New Layout)
  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="max-w-3xl mx-auto px-4 pt-4">
          {/* Top Bar Skeleton */}
          <div className="flex justify-between items-center mb-6 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
          {/* Header Skeleton */}
          <div className="flex justify-between items-start mb-6 animate-pulse">
            <div className="flex-1 space-y-3">
              <div className="w-3/4 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
              <div className="w-1/3 h-4 bg-gray-100 rounded-md"></div>
            </div>
            <div className="w-16 h-20 bg-gray-200 rounded-xl"></div>
          </div>
          {/* Filters Skeleton */}
          <div className="flex gap-3 mb-8 overflow-hidden animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-24 h-10 bg-gray-200 rounded-xl shrink-0"
              ></div>
            ))}
          </div>
          {/* Menu Items Skeleton */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border-b border-gray-100 py-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 animate-pulse">
                  <div className="w-4 h-4 bg-gray-200 rounded-sm mb-3"></div>
                  <div className="w-3/4 h-6 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="w-20 h-5 bg-gray-200 rounded-md mb-4"></div>
                  <div className="space-y-2 mt-4 hidden sm:block">
                    <div className="h-3 bg-gray-100 rounded-md w-full"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-5/6"></div>
                  </div>
                </div>
                <div className="relative min-w-[140px] animate-pulse">
                  <div className="w-[140px] h-[140px] bg-gray-200 rounded-2xl"></div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-300 w-28 h-10 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans relative">
      {/* STICKY TOP NAV */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-colors shrink-0"
          >
            <FiArrowLeft className="text-xl" />
          </button>

          <div className="flex-1 relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E23744] transition-colors" />
            <input
              type="text"
              placeholder="Search in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 text-gray-800 text-sm font-medium rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#E23744]/20 transition-all"
            />
          </div>

          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-colors shrink-0">
            <FiShare2 className="text-lg" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-4">
        {/* SHOP DETAILS HEADER */}
        <div className="flex justify-between items-start pb-6 border-b border-gray-100 border-dashed">
          <div className="pr-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {shop?.name || "Restaurant Name"}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1 line-clamp-1">
              {shop?.categories?.join(", ") ||
                "Multi-Cuisine, Beverages, Desserts"}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-1">
                <FiMapPin className="text-gray-400" />
                {shop?.city || shop?.address || "City Area"}
                {shop?.distance && (
                  <span className="text-[#E23744]">({shop.distance})</span>
                )}
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <FiClock className="text-gray-400" />
                {shop?.deliveryTime || "30-40"} mins
              </span>
            </div>
          </div>

          {/* RATING BOX */}
          <div className="flex flex-col items-center bg-[#24963F] text-white rounded-xl shadow-sm overflow-hidden shrink-0">
            <div className="px-3 py-1.5 flex items-center gap-1 font-bold text-base sm:text-lg">
              {shop?.rating || "4.2"} <FaStar className="text-[12px]" />
            </div>
            <div className="bg-white text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 w-full text-center border-t border-gray-100">
              {shop?.totalReviews >= 1000
                ? `${(shop.totalReviews / 1000).toFixed(1)}k`
                : shop?.totalReviews || "1k+"}{" "}
              Ratings
            </div>
          </div>
        </div>

        {/* STICKY FILTER TABS */}
        <div className="sticky top-[65px] bg-white z-30 py-4 flex gap-3 overflow-x-auto scrollbar-none border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0 mask-gradient">
          {/* Veg Only Pill */}
          <button
            onClick={handleVegToggle}
            className={`border rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 transition-colors ${
              vegOnly
                ? "bg-green-50 border-green-500"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-sm border flex items-center justify-center ${vegOnly ? "border-green-600" : "border-gray-400"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${vegOnly ? "bg-green-600" : "bg-gray-400"}`}
              ></div>
            </div>
            <span className="text-[13px] font-bold text-gray-700 tracking-wide">
              Veg
            </span>
          </button>

          {/* Non-Veg Only Pill */}
          <button
            onClick={handleNonVegToggle}
            className={`border rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 transition-colors ${
              nonVegOnly
                ? "bg-red-50 border-red-500"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-sm border flex items-center justify-center ${nonVegOnly ? "border-[#E23744]" : "border-gray-400"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${nonVegOnly ? "bg-[#E23744]" : "bg-gray-400"}`}
              ></div>
            </div>
            <span className="text-[13px] font-bold text-gray-700 tracking-wide">
              Non-Veg
            </span>
          </button>

          <div className="w-[1px] h-8 bg-gray-200 shrink-0 self-center mx-1"></div>

          {/* Dynamic Category Pills */}
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-[13px] font-bold tracking-wide transition-all shrink-0 border ${
                activeCategory === c
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* MENU LIST */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
            {activeCategory === "All" ? "Recommended" : activeCategory}
            <span className="text-sm font-medium text-gray-400">
              {displayItems?.length || 0} items
            </span>
          </h2>

          {displayItems?.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <FiSearch className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                No items match your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setVegOnly(false);
                  setNonVegOnly(false);
                  setActiveCategory("All");
                }}
                className="mt-4 text-[#E23744] font-bold text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayItems?.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-200/70 py-6 sm:py-8 last:border-0 group"
                >
                  <div className="flex items-start justify-between gap-4 sm:gap-8">
                    {/* LEFT CONTENT */}
                    <div className="flex-1 pr-2 sm:pr-4">
                      {/* VEG/NONVEG ICON */}
                      {item.type?.toLowerCase() && (
                        <div className="mb-2">
                          <div
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                              item.type?.toLowerCase() === "veg"
                                ? "border-[#1D8F24]"
                                : "border-[#E23744]"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.type?.toLowerCase() === "veg"
                                  ? "bg-[#1D8F24]"
                                  : "bg-[#E23744]"
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* NAME */}
                      <h3 className="text-[17px] sm:text-[19px] font-bold text-gray-800 leading-snug">
                        {item.name}
                      </h3>

                      {/* PRICE */}
                      <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 mt-1.5">
                        ₹{item.price}
                      </p>

                      {/* RATING TAG */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[11px] font-bold"
                          style={{ backgroundColor: RATING_GREEN }}
                        >
                          <span>{item.rating || "4.0"}</span>
                          <FaStar className="text-[9px]" />
                        </div>
                        <span className="text-gray-500 text-xs font-semibold">
                          ({item.totalReviews || 3} votes)
                        </span>
                      </div>

                      {/* DESCRIPTION */}
                      <div className="mt-3.5">
                        <p
                          className={`text-gray-500 text-[13px] sm:text-[14px] leading-relaxed transition-all duration-300 font-medium ${
                            expandedItem === item._id ? "" : "line-clamp-2"
                          }`}
                        >
                          {item.description}
                        </p>
                        {item.description?.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedItem(
                                expandedItem === item._id ? null : item._id,
                              );
                            }}
                            className="text-gray-800 text-[13px] font-bold mt-1.5 hover:text-gray-600 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            {expandedItem === item._id
                              ? "Read less"
                              : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RIGHT IMAGE & ADD BUTTON */}
                    <div className="relative min-w-[130px] sm:min-w-[156px] flex-shrink-0 mt-2">
                      <div className="relative rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          onClick={() => setSelectedItem(item)}
                          className="w-[130px] h-[130px] sm:w-[156px] sm:h-[156px] object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* ADD BUTTON (Zomato Floating Pill Style) */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[110px] sm:w-[120px] h-10 shadow-lg rounded-xl">
                        {cartCount[item._id] ? (
                          <div className="flex items-center justify-between w-full h-full bg-white border border-[#E23744] rounded-xl overflow-hidden">
                            <button
                              onClick={() =>
                                dispatch(
                                  removeFromCart({
                                    shopId: shop?._id,
                                    itemId: item._id,
                                  }),
                                )
                              }
                              className="w-1/3 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:bg-[#E23744]/10 active:bg-gray-100 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-1/3 h-full flex items-center justify-center text-[15px] font-bold text-[#E23744]">
                              {cartCount[item._id].quantity}
                            </span>
                            <button
                              onClick={() => handleAdd(item)}
                              className="w-1/3 h-full flex items-center justify-center text-xl font-bold text-[#E23744] hover:bg-[#E23744]/10 active:bg-red-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAdd(item)}
                            className="w-full h-full bg-white border border-gray-200 hover:border-[#E23744] rounded-xl text-[#E23744] font-bold text-[15px] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center shadow-sm"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* POPUP MODAL (Item Details) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl overflow-hidden max-w-md w-full relative max-h-[90vh] flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <FiX className="text-xl" />
              </button>

              <div className="h-[250px] sm:h-[300px] relative shrink-0">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {selectedItem.type?.toLowerCase() && (
                      <div className="mb-2">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                            selectedItem.type?.toLowerCase() === "veg"
                              ? "border-[#1D8F24]"
                              : "border-[#E23744]"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedItem.type?.toLowerCase() === "veg"
                                ? "bg-[#1D8F24]"
                                : "bg-[#E23744]"
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {selectedItem.name}
                    </h2>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ₹{selectedItem.price}
                    </p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mt-4 leading-relaxed font-medium">
                  {selectedItem.description}
                </p>

                {/* MODAL ACTION BUTTON */}
                <div className="mt-8">
                  {cartCount[selectedItem._id] ? (
                    <div className="flex items-center justify-between w-full h-12 bg-white border border-[#E23744] shadow-sm rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          dispatch(
                            removeFromCart({
                              shopId: shop?._id,
                              itemId: selectedItem._id,
                            }),
                          )
                        }
                        className="w-1/3 h-full flex items-center justify-center text-2xl font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-1/3 h-full flex items-center justify-center text-lg font-bold text-[#E23744]">
                        {cartCount[selectedItem._id].quantity}
                      </span>
                      <button
                        onClick={() => handleAdd(selectedItem)}
                        className="w-1/3 h-full flex items-center justify-center text-2xl font-bold text-[#E23744] hover:bg-red-50 active:bg-red-100"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(selectedItem)}
                      className="w-full py-3.5 rounded-xl bg-[#E23744] hover:bg-[#d62e3b] text-white font-bold text-[15px] uppercase tracking-wide transition-colors"
                    >
                      Add Item
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED VIEW CART BOTTOM BAR */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-3xl z-40"
          >
            <div
              onClick={() => navigate(`/cart/${shop?._id}`)}
              className="bg-[#E23744] text-white rounded-xl shadow-xl shadow-red-900/20 px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-[#d62e3b] active:scale-[0.98] transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-white/90 uppercase tracking-wider mb-0.5">
                  {totalItems} Item{totalItems > 1 ? "s" : ""} added
                </span>
                <span className="font-bold text-[17px] leading-none">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[15px] font-bold tracking-wide">
                View Cart
                <span className="text-xl leading-none">›</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuCard;
