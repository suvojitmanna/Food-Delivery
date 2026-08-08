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
  FiMenu,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/cartSlice";
import { calculateShopsDeliveryMetrics } from "../../utils/location";

const MenuCard = () => {
  const { id, shopId } = useParams();
  const modalRef = useRef();
  const searchInputRef = useRef();

  const [expandedItem, setExpandedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // STATES
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const carts = useSelector((state) => state.cart.carts);
  const { itemsInMyCity, shopInMyCity, loading, userData } = useSelector(
    (state) => state.user,
  );

  const shop = shopInMyCity?.find((item) => item._id === (id || shopId));

  const rawFilteredItems = itemsInMyCity?.filter(
    (item) => item.shop && item.shop._id.toString() === shop?._id?.toString(),
  );

  // Calculate Real Distance & Estimated Time using YOUR utility
  const calculatedDistanceInfo = useMemo(() => {
    if (!shop) return { distance: "2.5 km", time: "30-40 mins" };

    // Format user coords as [lng, lat] for your utility
    const userCoords = userData?.location?.coordinates || [
      userData?.location?.lng || userData?.location?.longitude,
      userData?.location?.lat || userData?.location?.latitude,
    ];

    // Ensure shop location has latitude/longitude properties mapped for the utility
    const shopForUtility = {
      ...shop,
      location: {
        ...shop.location,
        latitude:
          shop?.location?.latitude ||
          shop?.location?.lat ||
          shop?.location?.coordinates?.[1],
        longitude:
          shop?.location?.longitude ||
          shop?.location?.lng ||
          shop?.location?.coordinates?.[0],
      },
    };

    // Run your utility
    const [enhancedShop] = calculateShopsDeliveryMetrics(
      [shopForUtility],
      userCoords,
    );

    return {
      distance: enhancedShop?.distance || shop?.distance || "2.5 km",
      time: enhancedShop?.deliveryTime
        ? `${enhancedShop.deliveryTime} mins`
        : "30-40 mins",
    };
  }, [userData, shop]);

  const categories = useMemo(() => {
    const cats =
      rawFilteredItems?.map((item) => item.category).filter(Boolean) || [];
    return ["All", ...new Set(cats)];
  }, [rawFilteredItems]);

  const displayItems = useMemo(() => {
    return rawFilteredItems?.filter((item) => {
      if (vegOnly && item.type?.toLowerCase() !== "veg") return false;
      if (nonVegOnly && item.type?.toLowerCase() === "veg") return false;
      if (activeCategory !== "All" && item.category !== activeCategory)
        return false;
      return true;
    });
  }, [rawFilteredItems, vegOnly, nonVegOnly, activeCategory]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return rawFilteredItems || [];
    return rawFilteredItems?.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [rawFilteredItems, searchQuery]);

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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedItem(null);
      }
    };
    if (selectedItem)
      document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [selectedItem]);

  const handleAdd = (item) => dispatch(addToCart(item));

  const handleVegToggle = () => {
    setVegOnly(!vegOnly);
    if (!vegOnly) setNonVegOnly(false);
  };

  const handleNonVegToggle = () => {
    setNonVegOnly(!nonVegOnly);
    if (!nonVegOnly) setVegOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 p-4">
        <div className="animate-pulse space-y-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="w-3/4 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-full h-40 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans relative">
      {/* STICKY TOP NAV */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-colors shrink-0 cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>

          <div
            className="flex-1 relative group cursor-text"
            onClick={() => setIsSearchActive(true)}
          >
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <div className="w-full bg-gray-100 text-gray-500 text-sm font-medium rounded-xl py-2.5 pl-10 pr-4 outline-none">
              Search for dishes...
            </div>
          </div>

          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-colors shrink-0">
            <FiShare2 className="text-lg" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-4">
        {/* SHOP DETAILS HEADER */}
        <div className="flex justify-between items-start pb-5 border-b border-gray-100 border-dashed">
          <div className="pr-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {shop?.name || "Restaurant Name"}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1 line-clamp-1">
              {shop?.description || "Multi-Cuisine, Beverages, Desserts"}
            </p>

            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#24963F] animate-pulse"></div>
              <span className="text-[#24963F] text-[13px] font-bold">
                Open now
              </span>
              <span className="text-gray-400 text-[13px] font-medium">
                - Closes at {shop?.closeTime || "11:00 PM"}
              </span>
            </div>

            {/* DYNAMIC DISTANCE & TIME FROM UTILS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                <FiMapPin className="text-[#E23744]" />
                {calculatedDistanceInfo.distance}
              </span>
              <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                <FiClock className="text-orange-500" />
                {calculatedDistanceInfo.time}
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
        <div className="sticky top-[65px] bg-white z-20 py-4 flex gap-3 overflow-x-auto scrollbar-none border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0 mask-gradient">
          <button
            onClick={handleVegToggle}
            className={`border rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 transition-colors ${vegOnly ? "bg-green-50 border-green-500" : "bg-white border-gray-200"}`}
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

          <button
            onClick={handleNonVegToggle}
            className={`border rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 transition-colors ${nonVegOnly ? "bg-green-50 border-green-500" : "bg-white border-gray-200"}`}
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

          <AnimatePresence mode="popLayout">
            {displayItems?.map((item, index) => (
              <motion.div
                key={item._id || index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border-b border-gray-200/70 py-6 sm:py-8 last:border-0 group"
              >
                <div className="flex items-start justify-between gap-4 sm:gap-8">
                  {/* LEFT CONTENT */}
                  <div className="flex-1 pr-2 sm:pr-4">
                    {item.type?.toLowerCase() && (
                      <div className="mb-2">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${item.type?.toLowerCase() === "veg" ? "border-[#1D8F24]" : "border-[#E23744]"}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${item.type?.toLowerCase() === "veg" ? "bg-[#1D8F24]" : "bg-[#E23744]"}`}
                          />
                        </div>
                      </div>
                    )}
                    <h3 className="text-[17px] sm:text-[19px] font-bold text-gray-800 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 mt-1.5">
                      ₹{item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[11px] font-bold bg-[#24963F]">
                        <span>{item.rating || "4.0"}</span>
                        <FaStar className="text-[9px]" />
                      </div>
                      <span className="text-gray-500 text-xs font-semibold">
                        ({item.totalReviews || 3} votes)
                      </span>
                    </div>
                    <div className="mt-3.5">
                      <p
                        className={`text-gray-500 text-[13px] sm:text-[14px] leading-relaxed font-medium ${expandedItem === item._id ? "" : "line-clamp-2"}`}
                      >
                        {item.description}
                      </p>
                      {item.description?.length > 100 && (
                        <button
                          onClick={() =>
                            setExpandedItem(
                              expandedItem === item._id ? null : item._id,
                            )
                          }
                          className="text-gray-800 text-[13px] font-bold mt-1.5 hover:text-gray-600 transition-all cursor-pointer"
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
                            className="w-1/3 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:bg-gray-100"
                          >
                            {" "}
                            −{" "}
                          </button>
                          <span className="w-1/3 h-full flex items-center justify-center text-[15px] font-bold text-[#E23744]">
                            {cartCount[item._id].quantity}
                          </span>
                          <button
                            onClick={() => handleAdd(item)}
                            className="w-1/3 h-full flex items-center justify-center text-xl font-bold text-[#E23744] hover:bg-green-50"
                          >
                            {" "}
                            +{" "}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(item)}
                          className="w-full h-full bg-white border border-gray-200 hover:border-[#E23744] rounded-xl text-[#E23744] font-bold text-[15px] uppercase tracking-wider shadow-sm"
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
        </div>
      </div>

      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 shadow-sm">
              <button
                onClick={() => {
                  setIsSearchActive(false);
                  setSearchQuery("");
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-gray-900 text-[17px] outline-none font-medium placeholder-gray-400"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 p-2"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto bg-white px-4 py-2 pb-24">
              {searchResults?.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start justify-between gap-4 py-6 border-b border-gray-100 bg-white"
                  >
                    {/* LEFT SIDE*/}
                    <div className="flex-1 pr-2">
                      {item.type?.toLowerCase() && (
                        <div className="mb-2">
                          <div
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center ${item.type?.toLowerCase() === "veg" ? "border-[#1D8F24]" : "border-[#E23744]"}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${item.type?.toLowerCase() === "veg" ? "bg-[#1D8F24]" : "bg-[#E23744]"}`}
                            />
                          </div>
                        </div>
                      )}

                      <h4 className="font-bold text-gray-800 text-[17px] leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-gray-900 font-bold text-[15px] mt-1.5">
                        ₹{item.price}
                      </p>

                      {item.description && (
                        <p className="text-gray-500 text-[13px] mt-2 line-clamp-2 font-medium">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* RIGHT SIDE*/}
                    <div className="relative min-w-[130px] shrink-0 mt-1">
                      <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-[130px] h-[130px] object-cover"
                          />
                        ) : (
                          <div className="w-[130px] h-[130px] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Floating Add Button */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[110px] h-10 shadow-lg rounded-xl">
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
                              className="w-1/3 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="w-1/3 h-full flex items-center justify-center text-[15px] font-bold text-[#E23744]">
                              {cartCount[item._id].quantity}
                            </span>
                            <button
                              onClick={() => handleAdd(item)}
                              className="w-1/3 h-full flex items-center justify-center text-xl font-bold text-[#E23744] hover:bg-green-50"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAdd(item)}
                            className="w-full h-full bg-white border border-gray-200 hover:border-[#E23744] rounded-xl text-[#E23744] font-bold text-[15px] uppercase tracking-wider shadow-sm transition-colors"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-12 text-center text-gray-500 font-medium">
                  No matches found for "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsMenuOpen(true)}
        className={`fixed right-5 z-30 bg-black/90 text-white shadow-2xl rounded-full px-5 py-3.5 flex items-center gap-2.5 font-bold transition-all duration-300 hover:scale-105 ${
          totalItems > 0 ? "bottom-24" : "bottom-8"
        }`}
      >
        <FiMenu className="text-lg" />
        <span className="text-[13px] tracking-wide uppercase">Menu</span>
      </motion.button>

      {/* MENU CATEGORIES BOTTOM SHEET */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 max-h-[60vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-extrabold text-gray-900">Menu</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <FiX className="text-gray-600" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsMenuOpen(false);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className={`w-full flex items-center justify-between py-4 border-b border-gray-100 text-left ${activeCategory === cat ? "text-[#E23744] font-bold" : "text-gray-700 font-medium"}`}
                  >
                    <span className="text-[16px]">
                      {cat === "All" ? "Recommended" : cat}
                    </span>
                    {activeCategory === cat && (
                      <FiChevronRight className="text-lg" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ITEM POPUP MODAL */}
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
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
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
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {selectedItem.name}
                </h2>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₹{selectedItem.price}
                </p>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed font-medium">
                  {selectedItem.description}
                </p>
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
                        className="w-1/3 h-full flex items-center justify-center text-2xl font-bold text-gray-600 hover:bg-gray-50"
                      >
                        {" "}
                        −{" "}
                      </button>
                      <span className="w-1/3 h-full flex items-center justify-center text-lg font-bold text-[#E23744]">
                        {cartCount[selectedItem._id].quantity}
                      </span>
                      <button
                        onClick={() => handleAdd(selectedItem)}
                        className="w-1/3 h-full flex items-center justify-center text-2xl font-bold text-[#E23744] hover:bg-green-50"
                      >
                        {" "}
                        +{" "}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(selectedItem)}
                      className="w-full py-3.5 rounded-xl bg-[#E23744] hover:bg-[#d62e3b] text-white font-bold text-[15px] uppercase tracking-wide"
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
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-3xl z-30"
          >
            <div
              onClick={() => navigate(`/cart/${shop?._id}`)}
              className="bg-green-700 text-white rounded-xl shadow-xl shadow-green-900/20 px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-green-800 active:scale-[0.98] transition-all"
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
                View Cart <span className="text-xl leading-none">›</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuCard;
