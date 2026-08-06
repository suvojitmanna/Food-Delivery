import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiCheck } from "react-icons/fi";

const OrderPlaced = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const addressData = location.state?.address;
  const orderId = location.state?.orderId;

  const displayAddress = addressData
    ? `${addressData.flatNo}, ${addressData.streetArea}`
    : "Your saved delivery address";

  const addressType = addressData?.addressType || "Home";

  useEffect(() => {
    if (!orderId) return;

    const timer = setTimeout(() => {
      navigate(`/track-order/${orderId}`, { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
          >
            <FiCheck className="text-white text-5xl stroke-[3]" />
          </motion.div>
        </motion.div>

        {/* Success Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Order Placed!
          </h1>
          <p className="text-gray-500 font-medium mb-8">
            Sit tight! The restaurant is preparing your food.
          </p>
        </motion.div>

        {/* Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3 text-left mb-8 shadow-sm"
        >
          <div className="bg-white p-2 rounded-full shadow-sm text-green-600 mt-0.5">
            <FiMapPin size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-0.5">
              Delivering to {addressType}
            </h3>
            {/* Render the safely formatted string here */}
            <p className="text-gray-600 text-xs line-clamp-2 font-medium leading-relaxed">
              {displayAddress}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
            ))}
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Redirecting to tracking
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderPlaced;
