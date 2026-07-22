import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 
import { clearAllCart } from "../redux/cartSlice";
import RestaurantCartCard from "./RestaurantCartCard";

const CartBottomSheet = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const carts = useSelector((state) => state.cart.carts);
  const cartList = Object.values(carts);

  const handleDragEnd = (event, info) => {
    const shouldClose = info.offset.y > 100 || info.velocity.y > 500;
    if (shouldClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* BOTTOM SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[999] bg-white rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-100 cursor-grab active:cursor-grabbing touch-none">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-800">
                  Your Carts{" "}
                  <span className="text-gray-500 text-lg font-bold">
                    ({cartList.length})
                  </span>
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4 overscroll-contain"
              onPointerDownCapture={(e) => {
                e.stopPropagation();
              }}
            >
              {cartList.length > 0 ? (
                cartList.map((cart) => (
                  <RestaurantCartCard 
                    key={cart.shop._id} 
                    cart={cart} 
                    onClose={onClose}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-10 font-medium">
                  Your cart is currently empty.
                </div>
              )}
            </div>

            {/* BOTTOM ACTION BUTTONS (Sticky) */}
            {cartList.length > 0 && (
              <div className="shrink-0 px-6 py-5 bg-white border-t border-gray-100 pb-safe">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      dispatch(clearAllCart());
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 flex-1 h-14 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 active:scale-95 transition-all"
                  >
                    <FiTrash2 size={20} />
                    Clear All
                  </button>

                  <button 
                    onClick={() => {
                      navigate('/multi-cart');
                      onClose(); 
                    }}
                    className="flex-1 h-14 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-600/30"
                  >
                    Checkout All
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartBottomSheet;