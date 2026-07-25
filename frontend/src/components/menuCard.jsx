import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/cartSlice";

const MenuCard = () => {
  // Consolidate useParams
  const { id, shopId } = useParams();
  const modalRef = useRef();
  const [expandedItem, setExpandedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const carts = useSelector((state) => state.cart.carts);
  const { itemsInMyCity, shopInMyCity, loading } = useSelector(
    (state) => state.user,
  );

  // Find the current shop based on the URL parameter
  const shop = shopInMyCity?.find((item) => item._id === (id || shopId));

  // Filter items for this specific shop
  const filteredItems = itemsInMyCity?.filter(
    (item) => item.shop._id === shop?._id,
  );

  // Get the cart for this specific shop
  const currentShopCart = carts[shop?._id] || { items: {} };
  const cartCount = currentShopCart.items;

  // Calculate totals
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

  //SKELETON LOADER
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* HEADER SKELETON */}
          <div className="w-48 sm:w-64 h-8 sm:h-10 bg-slate-200 rounded-lg mb-4 animate-pulse"></div>
          <hr className="border-2 border-slate-300 mb-8" />

          {/* MENU ITEMS SKELETON */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border-b border-slate-300 py-6 sm:py-8">
              <div className="flex items-start justify-between gap-4 sm:gap-8">
                {/* LEFT CONTENT SKELETON */}
                <div className="flex-1 animate-pulse">
                  <div className="w-4 h-4 bg-slate-200 rounded-sm mb-2 sm:mb-3"></div>
                  <div className="w-3/4 h-6 sm:h-8 bg-slate-200 rounded-lg mb-3 sm:mb-4"></div>
                  <div className="w-20 sm:w-24 h-5 sm:h-6 bg-slate-200 rounded-md mb-2 sm:mb-3"></div>
                  <div className="w-14 sm:w-16 h-3 sm:h-4 bg-slate-200 rounded-md mb-3 sm:mb-4"></div>
                  <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-4 hidden sm:block">
                    <div className="h-3 sm:h-4 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-3 sm:h-4 bg-slate-200 rounded-md w-5/6"></div>
                    <div className="h-3 sm:h-4 bg-slate-200 rounded-md w-4/6"></div>
                  </div>
                </div>

                {/* RIGHT IMAGE SKELETON */}
                <div className="relative min-w-[130px] sm:min-w-[220px] flex-shrink-0 animate-pulse mt-2 sm:mt-0">
                  <div className="w-[130px] h-[130px] sm:w-[220px] sm:h-[180px] bg-slate-200 rounded-2xl sm:rounded-3xl"></div>
                  <div className="absolute bottom-[-16px] sm:bottom-[-20px] left-1/2 -translate-x-1/2 bg-slate-300 w-24 sm:w-32 h-10 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg border border-white"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8 pb-32">
      {/* MENU GRID */}
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-800">
            Recommended ({filteredItems?.length || 0})
          </h1>
        </div>

        <hr className="border-2 border-slate-300" />

        {/* ITEMS */}
        {filteredItems?.map((item, index) => (
          <motion.div
            key={item._id || index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
            }}
            className="border-b border-slate-300 py-6 sm:py-8"
          >
            <div className="flex items-start justify-between gap-4 sm:gap-8">
              {/* LEFT CONTENT */}
              <div className="flex-1">
                {/* VEG/NONVEG ICON */}
                {item.type?.toLowerCase() && (
                  <div className="mb-2 sm:mb-3">
                    <div
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border flex items-center justify-center ${
                        item.type?.toLowerCase() === "veg"
                          ? "border-green-600"
                          : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          item.type?.toLowerCase() === "veg"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* NAME */}
                <h2 className="text-lg sm:text-3xl font-black text-slate-800 leading-tight">
                  {item.name}
                </h2>

                {/* PRICE */}
                <p className="text-base sm:text-2xl font-bold mt-1 sm:mt-2">
                  ₹{item.price}
                </p>

                {/* RATING */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-green-600 font-bold">
                  <FaStar className="text-xs sm:text-sm" />
                  <span className="text-sm sm:text-base">
                    {item.rating || "4.0"}
                  </span>
                  <span className="text-slate-400 text-xs sm:text-sm font-medium">
                    ({item.totalReviews || 3})
                  </span>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-1 sm:mt-2 max-w-3xl">
                  <p
                    className={`text-slate-500 text-xs sm:text-sm leading-5 sm:leading-6 transition-all duration-300 ${
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
                      className="text-slate-700 text-xs sm:text-sm font-bold mt-0.5 sm:mt-1 hover:text-black transition-all cursor-pointer"
                    >
                      <span className="underline text-gray-400">
                        {expandedItem === item._id ? "less" : "more"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="relative min-w-[130px] sm:min-w-[220px] flex-shrink-0 mt-2 sm:mt-0">
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => setSelectedItem(item)}
                    className="w-[130px] h-[130px] sm:w-[220px] sm:h-[180px] rounded-2xl sm:rounded-3xl object-cover cursor-pointer"
                  />

                  {/* VEG ICON ON IMAGE */}
                  {item.type?.toLowerCase() && (
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white p-1 rounded-md sm:rounded-lg shadow-md">
                      <div
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm border flex items-center justify-center ${
                          item.type?.toLowerCase() === "veg"
                            ? "border-green-600"
                            : "border-red-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            item.type?.toLowerCase() === "veg"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ADD BUTTON */}
                {cartCount[item._id] ? (
                  <div className="absolute bottom-[-16px] sm:bottom-[-20px] left-1/2 -translate-x-1/2 flex items-center justify-between w-[110px] sm:w-auto sm:gap-5 bg-white border shadow-lg px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl">
                    <button
                      onClick={() =>
                        dispatch(
                          removeFromCart({
                            shopId: shop?._id,
                            itemId: item._id,
                          }),
                        )
                      }
                      className="text-xl sm:text-3xl font-black text-green-600 active:scale-90 transition-transform cursor-pointer"
                    >
                      -
                    </button>

                    <span className="text-base sm:text-xl font-black text-green-600">
                      {cartCount[item._id].quantity}
                    </span>

                    <button
                      onClick={() => handleAdd(item)}
                      className="text-xl sm:text-3xl font-black text-green-600 active:scale-90 transition-transform cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAdd(item)}
                    className="absolute bottom-[-16px] sm:bottom-[-20px] left-1/2 -translate-x-1/2 bg-white border shadow-lg px-8 py-1.5 sm:px-10 sm:py-3 rounded-xl sm:rounded-2xl text-green-600 font-black text-sm sm:text-base active:scale-95 transition-transform cursor-pointer"
                  >
                    ADD
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-[25px] sm:rounded-[35px] overflow-hidden max-w-lg w-full relative max-h-[90vh] flex flex-col"
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center active:scale-90 transition-transform"
              >
                <FiX className="text-lg sm:text-xl" />
              </button>

              {/* IMAGE */}
              <div className="h-[250px] sm:h-[350px] relative shrink-0">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />

                {selectedItem.type?.toLowerCase() && (
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/90 backdrop-blur-md p-1 rounded-lg shadow-md">
                    <div
                      className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                        selectedItem.type?.toLowerCase() === "veg"
                          ? "border-green-600"
                          : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedItem.type?.toLowerCase() === "veg"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SCROLLABLE CONTENT AREA */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {selectedItem.type?.toLowerCase() && (
                  <div className="px-4 sm:px-5 pt-4 sm:pt-5">
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                        selectedItem.type?.toLowerCase() === "veg"
                          ? "border-green-600"
                          : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          selectedItem.type?.toLowerCase() === "veg"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className="px-4 sm:px-5 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                        {selectedItem.name}
                      </h2>

                      <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-slate-900">
                        ₹{selectedItem.price}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 sm:mt-3 text-green-600 font-bold text-sm sm:text-base">
                        <FaStar />
                        {selectedItem.rating || "4.5"}
                      </div>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      {cartCount[selectedItem._id] ? (
                        <div className="flex items-center justify-between sm:justify-center gap-6 sm:gap-4 bg-green-500 text-white px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl w-full sm:w-auto">
                          <button
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  shopId: shop?._id,
                                  itemId: selectedItem._id,
                                }),
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-2xl font-bold hover:bg-white/20 rounded-full transition active:scale-90 cursor-pointer"
                          >
                            -
                          </button>

                          <span className="min-w-[24px] text-center text-lg sm:text-xl font-bold">
                            {cartCount[selectedItem._id].quantity}
                          </span>

                          <button
                            onClick={() => handleAdd(selectedItem)}
                            className="w-8 h-8 flex items-center justify-center text-2xl font-bold hover:bg-white/20 rounded-full transition active:scale-90 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(selectedItem)}
                          className="w-full sm:w-auto px-8 py-3 rounded-xl sm:rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base sm:text-lg transition-all duration-300 active:scale-95"
                        >
                          ADD ITEM
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm sm:text-base mt-4 sm:mt-5 leading-relaxed">
                    {selectedItem.description}
                  </p>
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
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-3xl bg-green-600 text-white rounded-2xl shadow-xl shadow-green-600/30 px-5 py-3 sm:px-6 sm:py-4 flex justify-between items-center z-40 cursor-pointer hover:bg-green-700 active:scale-[0.98] transition-all"
            onClick={() => navigate(`/cart/${shop?._id}`)}
          >
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {totalItems} Item{totalItems > 1 ? "s" : ""} Added
              </h3>
              <p className="text-xs sm:text-sm font-medium text-green-100 mt-0.5">
                ₹{totalPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold">
              View Cart
              <span className="text-lg sm:text-xl">→</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuCard;
