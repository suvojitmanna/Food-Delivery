import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { TiShoppingCart } from "react-icons/ti";
import { FiChevronRight } from "react-icons/fi"; 

const FloatingCartBar = ({ onOpen }) => {
  const carts = useSelector((state) => state.cart.carts);

  const totalRestaurants = Object.keys(carts).length;

  const totalItems = Object.values(carts).reduce((shopTotal, shop) => {
    return (
      shopTotal +
      Object.values(shop.items).reduce(
        (itemTotal, item) => itemTotal + item.quantity,
        0,
      )
    );
  }, 0);

  return (
    <AnimatePresence>
      {totalRestaurants > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onOpen}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                     w-[92%] max-w-sm
                     bg-neutral-900/95 backdrop-blur-md text-white
                     border border-neutral-700/50
                     rounded-full shadow-2xl shadow-neutral-900/50
                     p-2 pr-5
                     flex items-center justify-between
                     cursor-pointer group overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-green-500 text-white p-3 rounded-full flex items-center justify-center shadow-inner">
              <TiShoppingCart className="text-2xl" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900"></span>
            </div>

            <div className="flex flex-col">
              <h3 className="font-bold text-sm tracking-wide text-neutral-100">
                {totalRestaurants} {totalRestaurants > 1 ? "Restaurants" : "Restaurant"}
              </h3>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                {totalItems} item{totalItems > 1 ? "s" : ""} added
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-green-400 group-hover:text-green-300 transition-colors">
            <span className="font-semibold text-sm">View</span>
            <FiChevronRight className="text-xl group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default FloatingCartBar;
