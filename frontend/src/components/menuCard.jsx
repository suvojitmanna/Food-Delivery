import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { FiPlus, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const MenuCard = () => {
  const { id } = useParams();
  const modalRef = useRef();
  const [expandedItem, setExpandedItem] = useState(null);
  const [cartCount, setCartCount] = useState({});
  const { itemsInMyCity, shopInMyCity, loading } = useSelector(
    (state) => state.user,
  );

  // MODAL STATE
  const [selectedItem, setSelectedItem] = useState(null);

  const shop = shopInMyCity?.find((item) => item._id === id);

  const filteredItems = itemsInMyCity?.filter(
    (item) => item.shop._id === shop?._id,
  );

  if (loading) {
    return <div>Loading...</div>;
  }
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
                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex items-center gap-5 bg-white border border-slate-200 shadow-lg px-6 py-3 rounded-2xl">
                    <button
                      onClick={() =>
                        setCartCount((prev) => ({
                          ...prev,
                          [item._id]: prev[item._id] - 1,
                        }))
                      }
                      className="text-3xl font-black text-green-600 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-green-600">
                      {cartCount[item._id]}
                    </span>
                    <button
                      onClick={() =>
                        setCartCount((prev) => ({
                          ...prev,
                          [item._id]: prev[item._id] + 1,
                        }))
                      }
                      className="text-3xl font-black text-green-600 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setCartCount((prev) => ({
                        ...prev,
                        [item._id]: 1,
                      }))
                    }
                    className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-lg px-10 py-3 rounded-2xl text-green-600 font-black text-2xl hover:bg-slate-50 transition-all whitespace-nowrap"
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

                  <button className="px-8 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg cursor-pointer">
                    ADD
                  </button>
                </div>

                <p className="text-slate-600 mt-5 leading-relaxed pb-6">
                  {selectedItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuCard;
