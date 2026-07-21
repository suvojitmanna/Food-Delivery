import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiTrash2,
  FiShoppingBag,
  FiChevronRight,
  FiStar,
  FiClock,
  FiMapPin,
  FiTag,
  FiCreditCard,
  FiInfo,
} from "react-icons/fi";
import { addToCart, removeFromCart } from "../redux/cartSlice";

const Cart = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart.carts[shopId]);

  // --- PREMIUM EMPTY STATE ---
  if (!cart || Object.keys(cart.items).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="w-24 h-24 bg-white rounded-full shadow-xl shadow-gray-200/50 flex items-center justify-center text-gray-300 mb-6"
        >
          <FiShoppingBag size={40} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-[250px]">
          Looks like you haven't added anything from this restaurant yet.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-black/20 active:scale-95 transition-all"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const items = Object.values(cart.items);

  // --- BILLING CALCULATIONS ---
  const itemTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const platformFee = 8;
  const gst = Math.round(itemTotal * 0.05); // Assuming 5% GST
  const deliveryFee = 0; // Free Delivery
  const grandTotal = itemTotal + platformFee + gst + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-100 pb-32 font-sans selection:bg-green-100 selection:text-green-900">
      {/* --- HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md pt-safe">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Checkout</h1>
        </div>
      </header>

      {/* --- RESTAURANT INFO CARD --- */}
      <div className="bg-white px-5 pt-2 pb-6 rounded-b-[30px] shadow-sm mb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
          {cart.shop.name || "Restaurant"}
        </h1>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
            <FiStar className="fill-green-700" size={13} /> 4.5
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={14} /> 30 mins
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-green-600 font-bold">Free Delivery</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* --- ITEMS SECTION --- */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            Your Order
          </h3>

          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FiShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0 shadow-sm">
                    <button
                      onClick={() =>
                        dispatch(removeFromCart({ shopId, itemId: item._id }))
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-90 transition-all"
                    >
                      {item.quantity === 1 ? (
                        <FiTrash2 size={14} className="text-red-500" />
                      ) : (
                        <FiMinus size={14} />
                      )}
                    </button>
                    <span className="font-bold text-sm text-green-600 min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch(addToCart(item))}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-green-50 text-green-600 hover:bg-green-100 active:scale-90 transition-all"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- COUPON SECTION --- */}
        <button className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiTag size={20} />
            </div>
            <span className="font-bold text-gray-800">Apply Coupon</span>
          </div>
          <FiChevronRight
            className="text-gray-400 group-hover:translate-x-1 transition-transform"
            size={20}
          />
        </button>

        {/* --- DELIVERY ADDRESS --- */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 mt-0.5 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                <FiMapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  Delivery Address
                </h3>
                <p className="text-gray-800 font-medium text-sm mt-1">Home</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                  Salt Lake, Sector V, Kolkata, West Bengal
                </p>
              </div>
            </div>
            <button className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
              Change
            </button>
          </div>
        </div>

        {/* --- BILL DETAILS --- */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Bill Details</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span className="font-medium text-gray-900">
                ₹{itemTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-bold tracking-wide">
                FREE
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                Platform Fee <FiInfo size={12} className="text-gray-400" />
              </span>
              <span className="font-medium text-gray-900">₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST and Restaurant Charges</span>
              <span className="font-medium text-gray-900">₹{gst}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
            <span className="font-black text-gray-900 text-base">To Pay</span>
            <span className="font-black text-xl text-gray-900">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* --- PAYMENT METHOD --- */}
        <button className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiCreditCard size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                Payment Method
              </p>
              <span className="font-bold text-gray-800">Cash on Delivery</span>
            </div>
          </div>
          <FiChevronRight className="text-gray-400" size={20} />
        </button>
      </div>

      {/* --- BOTTOM CHECKOUT BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] pb-safe rounded-t-[30px] p-4">
        <button className="w-full h-[60px] bg-green-600 text-white rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all shadow-xl shadow-green-600/30 overflow-hidden relative group">
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col text-left">
            <span className="font-black text-lg leading-tight">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] font-medium text-green-100 uppercase tracking-wider">
              Total
            </span>
          </div>

          <div className="flex items-center gap-2 font-bold text-base">
            Proceed to Payment
            <FiChevronRight size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Cart;
