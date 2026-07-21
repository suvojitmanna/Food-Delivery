import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/cartSlice";

const MenuCard = () => {
  const { id } = useParams();
  const modalRef = useRef();
  const [expandedItem, setExpandedItem] = useState(null);
  const dispatch = useDispatch();
  const carts = useSelector((state) => state.cart.carts);

  const { itemsInMyCity, shopInMyCity, loading } = useSelector(
    (state) => state.user,
  );

  const [selectedItem, setSelectedItem] = useState(null);

  const shop = shopInMyCity?.find((item) => item._id === id);

  const filteredItems = itemsInMyCity?.filter(
    (item) => item.shop._id === shop?._id,
  );

  const currentShopCart = carts[shop?._id] || {
    items: {},
  };

  const cartCount = currentShopCart.items;
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedItem(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* HEADER SKELETON */}
          <div className="w-64 h-10 bg-slate-200 rounded-lg mb-4 animate-pulse"></div>
          <hr className="border-2 border-slate-300 mb-8" />

          {/* MENU ITEMS SKELETON */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border-b border-slate-300 py-8">
              <div className="flex items-start justify-between gap-8">
                {/* LEFT CONTENT SKELETON */}
                <div className="flex-1 animate-pulse">
                  <div className="w-4 h-4 bg-slate-200 rounded-sm mb-3"></div>
                  <div className="w-3/4 h-8 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="w-24 h-6 bg-slate-200 rounded-md mb-3"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded-md mb-4"></div>
                  <div className="space-y-3 mt-4">
                    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-4/6"></div>
                  </div>
                </div>

                {/* RIGHT IMAGE SKELETON */}
                <div className="relative min-w-[220px] flex-shrink-0 animate-pulse">
                  <div className="w-[220px] h-[180px] bg-slate-200 rounded-3xl"></div>
                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 bg-slate-300 w-32 h-12 rounded-2xl shadow-lg border border-white"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalItems = Object.values(cartCount).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalPrice = Object.values(cartCount).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleAdd = (item) => {
    dispatch(addToCart(item));
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8">
      {/* MENU GRID */}
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-black text-slate-800">
            Recommended ({filteredItems?.length})
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
            className="border-b border-slate-300 py-8"
          >
            <div className="flex items-start justify-between gap-8">
              {/* LEFT CONTENT */}
              <div className="flex-1">
                {/* VEG/NONVEG ICON */}
                {item.type?.toLowerCase() && (
                  <div className="mb-3">
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                        item.type?.toLowerCase() === "veg"
                          ? "border-green-600"
                          : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.type?.toLowerCase() === "veg"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* NAME */}
                <h2 className="text-3xl font-black text-slate-800">
                  {item.name}
                </h2>

                {/* PRICE */}
                <p className="text-2xl font-bold mt-2">₹{item.price}</p>

                {/* RATING */}
                <div className="flex items-center gap-2 mt-1 text-green-600 font-bold">
                  <FaStar className="text-sm" />
                  <span>{item.rating || "4.0"}</span>
                  <span className="text-slate-400 text-sm">
                    ({item.totalReviews || 3})
                  </span>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-1 max-w-3xl">
                  <p
                    className={`text-slate-500 text-sm leading-6 transition-all duration-300 ${
                      expandedItem === item._id ? "" : "line-clamp-2"
                    }`}
                  >
                    {item.description}
                  </p>
                  {item.description?.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedItem(
                          expandedItem === item._id ? null : item._id,
                        );
                      }}
                      className="text-slate-700 text-sm font-bold mt-1 hover:text-black transition-all cursor-pointer"
                    >
                      <div className="underline text-gray-400">
                        {expandedItem === item._id ? "less" : "more"}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="relative min-w-[220px] flex-shrink-0">
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => setSelectedItem(item)}
                    className="w-[220px] h-[180px] rounded-3xl object-cover cursor-pointer"
                  />

                  {/* VEG ICON ON IMAGE */}
                  {item.type?.toLowerCase() && (
                    <div className="absolute bottom-3 right-3 bg-white p-1 rounded-lg shadow-md">
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          item.type?.toLowerCase() === "veg"
                            ? "border-green-600"
                            : "border-red-600"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
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
                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex items-center gap-5 bg-white border shadow-lg px-6 py-3 rounded-2xl">
                    <button
                      onClick={() =>
                        dispatch(
                          removeFromCart({
                            shopId: shop._id,
                            itemId: item._id,
                          }),
                        )
                      }
                      className="text-3xl font-black text-green-600"
                    >
                      -
                    </button>

                    <span className="text-xl font-black text-green-600">
                      {cartCount[item._id].quantity}
                    </span>

                    <button
                      onClick={() => handleAdd(item)}
                      className="text-3xl font-black text-green-600"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAdd(item)}
                    className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 bg-white border shadow-lg px-10 py-3 rounded-2xl text-green-600 font-black"
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
              className="bg-white rounded-[35px] overflow-hidden max-w-lg w-full relative"
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
              >
                <FiX size={24} />
              </button>

              {/* IMAGE */}
              <div className="h-[350px] relative">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />

                {selectedItem.type?.toLowerCase() && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-1 rounded-lg shadow-md">
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
              {selectedItem.type?.toLowerCase() && (
                <div className="px-3 pt-3">
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

              {/* CONTENT */}
              <div className="px-5 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black">{selectedItem.name}</h2>

                    <p className="text-2xl font-bold mt-2">
                      ₹{selectedItem.price}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-green-600 font-bold">
                      <FaStar />
                      {selectedItem.rating || "4.5"}
                    </div>
                  </div>

                  {cartCount[selectedItem._id] ? (
                    <div className="flex items-center gap-4 bg-green-500 text-white px-6 py-3 rounded-2xl">
                      <button
                        onClick={() =>
                          dispatch(
                            removeFromCart({
                              shopId: selectedItem.shop._id,
                              itemId: selectedItem._id,
                            }),
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-2xl font-bold hover:bg-white/20 rounded-full transition"
                      >
                        -
                      </button>

                      <span className="min-w-[24px] text-center text-lg font-bold">
                        {cartCount[selectedItem._id].quantity}
                      </span>

                      <button
                        onClick={() => handleAdd(selectedItem)}
                        className="w-8 h-8 flex items-center justify-center text-2xl font-bold hover:bg-white/20 rounded-full transition"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(selectedItem)}
                      className="px-8 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition-all duration-300"
                    >
                      ADD
                    </button>
                  )}
                </div>

                <p className="text-slate-600 mt-5 leading-relaxed pb-6">
                  {selectedItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-green-600 text-white rounded-2xl shadow-2xl px-6 py-4 flex justify-between items-center z-50 cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <div>
              <h3 className="font-bold">
                {totalItems} Item{totalItems > 1 ? "s" : ""} Added
              </h3>

              <p className="text-sm">₹{totalPrice}</p>
            </div>

            <div className="text-lg font-bold">View Cart →</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuCard;
