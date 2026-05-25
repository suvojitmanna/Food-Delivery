import React from "react";
import { motion } from "framer-motion";

import {
  FaStar,
  FaHeart,
  FaClock,
  FaMotorcycle,
} from "react-icons/fa";

import { FiArrowRight } from "react-icons/fi";

const FoodCard = ({ item }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)] transition-all duration-500"
    >
      {/* IMAGE */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={item?.image}
          alt={item?.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* HEART */}
        <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-orange-500 hover:text-white transition-all">
          <FaHeart className="text-sm" />
        </button>

        {/* RATING */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md">
          <FaStar className="text-yellow-500 text-sm" />

          <span className="text-sm font-bold text-slate-800">
            {item?.rating || "4.5"}
          </span>
        </div>

        {/* ITEM INFO */}
        <div className="absolute bottom-5 left-5 right-5">
          <span className="text-[10px] tracking-[0.25em] uppercase text-orange-300 font-bold">
            {item?.category || "Premium Food"}
          </span>

          <h2 className="text-2xl font-black text-white mt-1 line-clamp-1">
            {item?.name}
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col gap-5">
        {/* DESCRIPTION */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
          {item?.description ||
            "Fresh handcrafted meals made with premium ingredients and lightning-fast delivery."}
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2">
          {(item?.tags || ["Fresh", "Hot", "Trending"])
            .slice(0, 3)
            .map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-100"
              >
                {tag}
              </span>
            ))}
        </div>

        {/* PRICE + DELIVERY */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">
              Starting From
            </span>

            <h3 className="text-2xl font-black text-slate-900">
              ₹{item?.price || 199}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FaClock className="text-orange-500 text-xs" />

              <span>{item?.deliveryTime || 25} mins</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FaMotorcycle className="text-orange-500 text-xs" />

              <span>Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-slate-200">
          Add To Cart

          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* GLOW */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-100/40 blur-3xl rounded-full pointer-events-none" />
    </motion.div>
  );
};

export default FoodCard;