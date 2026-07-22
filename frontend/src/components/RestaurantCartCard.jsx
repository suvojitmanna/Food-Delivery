import { motion } from "framer-motion";
import { FiClock, FiTrash2 } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearShopCart } from "../redux/cartSlice";

const RestaurantCartCard = ({ cart, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = Object.values(cart.items);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose(); 
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 p-3 pr-4 flex items-center gap-4 group hover:shadow-md transition-shadow"
    >
      {/* Restaurant Image */}
      <div className="relative shrink-0">
        <img
          src={cart.shop.image}
          alt={cart.shop.shopName}
          className="w-[84px] h-[84px] rounded-[18px] object-cover shadow-sm border border-gray-50"
        />
      </div>

      {/* Restaurant Info */}
      <div className="flex-1 py-1">
        <h3 className="font-bold text-[17px] text-gray-800 leading-tight line-clamp-1 pr-7">
          {cart.shop.name}
        </h3>

        <div className="flex items-center gap-2 mt-1 text-[13px]">
          <span className="text-gray-500 font-medium">
            {totalItems} Item{totalItems > 1 ? "s" : ""}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-gray-800 font-black">₹{totalPrice}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <FiClock size={14} className="text-gray-400" />
          <span>
            <strong className="text-gray-800 font-bold">
              {cart.shop.deliveryTime}
            </strong>{" "}
            mins
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => handleNavigate(`/menu/${cart.shop._id}`)}
            className="text-[13px] text-gray-400 hover:text-gray-700 font-semibold transition-colors underline underline-offset-4 decoration-gray-200 cursor-pointer"
          >
            View Menu
          </button>

          <button
            onClick={() => handleNavigate(`/cart/${cart.shop._id}`)}
            className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 px-4 py-1.5 rounded-xl font-bold text-[13px] transition-colors cursor-pointer"
          >
            View Cart
          </button>
        </div>
      </div>

      {/* Remove / Clear Button */}
      <button
        onClick={() => dispatch(clearShopCart(cart.shop._id))}
        className="absolute top-3 right-3 w-8 h-8 rounded-full md:bg-transparent md:text-gray-300 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all duration-200 cursor-pointer"
        title="Remove from carts"
      >
        <FiTrash2 size={15} />
      </button>
    </motion.div>
  );
};

export default RestaurantCartCard;