import React from "react";
import { motion } from "framer-motion";
import {
  FaStar,
  FaClock,
  FaMotorcycle,
  FaHeart,
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const MenuCard = () => {
  const { id } = useParams();

  const {
    itemsInMyCity,
    shopInMyCity,
    loading,
  } = useSelector((state) => state.user);

  // selected restaurant
  const shop = shopInMyCity?.find(
    (item) => item._id === id
  );

  const filteredItems = itemsInMyCity?.filter(
  (item) => item.shop._id === shop?._id
);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] p-8">
        <div className="animate-pulse space-y-8">
          <div className="w-full h-[350px] bg-slate-200 rounded-[40px]" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[30px] p-5 space-y-4"
              >
                <div className="h-56 bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded-full w-3/4" />
                <div className="h-4 bg-slate-100 rounded-full w-full" />
                <div className="h-10 bg-slate-200 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8">
      {/* HERO */}
      {shop && (
        <div className="relative overflow-hidden rounded-[40px] mb-14">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-[420px] object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute bottom-10 left-10 right-10">
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs tracking-[0.25em] uppercase font-bold">
              Premium Restaurant
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-white mt-5">
              {shop.name}
            </h1>

            <p className="text-slate-200 text-lg mt-4 max-w-2xl">
              {shop.description || "Luxury food experience"}
            </p>

            <div className="flex flex-wrap items-center gap-5 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-white">
                <FaStar className="text-yellow-400" />
                <span>{shop.rating || "4.5"} Rating</span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-white">
                <FaClock />
                <span>{shop.deliveryTime || 30} mins</span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-white">
                <FaMotorcycle />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TITLE */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-orange-500 font-bold tracking-[0.25em] uppercase text-xs">
            Curated Menu
          </span>

          <h2 className="text-4xl font-black text-slate-900 mt-2">
            Popular Dishes
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm font-semibold text-slate-500">
          {filteredItems?.length || 0} Items Available
        </div>
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredItems?.map((item, index) => (
          <motion.div
            key={item._id || index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
            }}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md">
                <FaHeart className="text-slate-600" />
              </button>

              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                  {item.category || "Popular"}
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {item.name}
                </h3>

                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">
                    Starting From
                  </span>

                  <h4 className="text-3xl font-black text-slate-900">
                    ₹{item.price}
                  </h4>
                </div>

                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded-2xl text-sm font-bold">
                  <FaStar className="text-xs" />
                  {item.rating || "4.5"}
                </div>
              </div>

              <button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300">
                <FiPlus />
                Add To Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MenuCard;