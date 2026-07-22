import { useState, useEffect } from "react";
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
  FiPackage,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
import { addToCart, removeFromCart } from "../redux/cartSlice";
import axios from "axios";
import { serverUrl } from "../App";

const Cart = () => {
  // 1. ALL HOOKS MUST BE AT THE TOP LEVEL (Before any early returns)
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const { shopId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const cart = useSelector((state) => state.cart.carts[shopId]);

  const getAddresses = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/delivery-address`, {
        withCredentials: true,
      });

      if (data.success) {
        setAddresses(data.addresses);
        const defaultAddress =
          data.addresses.find((a) => a.isDefault) || data.addresses[0];
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);
  if (!cart || !cart.items || Object.keys(cart.items).length === 0) {
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

  const itemTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const gstTotal = items.reduce(
    (sum, item) =>
      sum + (item.price * item.quantity * (Number(item.gst) || 0)) / 100,
    0,
  );

  const packingFeeTotal = items.reduce(
    (sum, item) => sum + (item.hasPackingFee ? 10 * item.quantity : 0),
    0,
  );

  const platformFee = 8;
  const deliveryFee = 0;

  const grandTotal = Math.round(
    itemTotal + platformFee + gstTotal + packingFeeTotal + deliveryFee,
  );

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?",
    );
    if (!confirmDelete) return;

    try {
      const { data } = await axios.delete(
        `${serverUrl}/api/delivery-address/${addressId}`,
        {
          withCredentials: true,
        },
      );
      if (data.success) {
        const updatedAddresses = addresses.filter(
          (address) => address._id !== addressId,
        );
        setAddresses(updatedAddresses);
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(
            updatedAddresses.find((a) => a.isDefault) ||
              updatedAddresses[0] ||
              null,
          );
        }
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(error.response?.data?.message || "Failed to delete address.");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const deliveryAddress = JSON.parse(
        localStorage.getItem("deliveryAddress"),
      );

      if (!deliveryAddress && !selectedAddress) {
        alert("Please select a delivery address.");
        navigate("/DeliveryAddressPage");
        return;
      }

      const cartItems = items.map((item) => ({
        _id: item._id,
        shop: shopId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const payload = {
        cartItems,
        paymentMethod: paymentMethod === "COD" ? "cod" : "online",
        deliveryAddress: deliveryAddress || selectedAddress,
        totalAmount: grandTotal,
      };

      const { data } = await axios.post(
        `${serverUrl}/api/order/place-order`,
        payload,
        {
          withCredentials: true,
        },
      );
      console.log(data)
      if (data.success) {
        alert("Order placed successfully!");
        navigate("/orders");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to place order.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-32 font-sans selection:bg-green-100 selection:text-green-900">
      {/* --- HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md pt-4">
        <div className="px-4 pb-4 flex items-center gap-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Checkout</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
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

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-gray-500 font-medium text-sm mt-1">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>

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
                <div className="w-8 h-8 mt-0.5 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                  <FiMapPin size={18} />
                </div>

                {selectedAddress ? (
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Delivery Address
                    </h3>
                    <p className="text-gray-800 font-medium text-sm mt-1">
                      {selectedAddress.addressType}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {selectedAddress.flatNo}, {selectedAddress.streetArea}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {selectedAddress.receiverName} •{" "}
                      {selectedAddress.phoneNumber}
                    </p>
                  </div>
                ) : (
                  <p>No Address Selected</p>
                )}
              </div>

              <button
                onClick={() =>
                  navigate(`/DeliveryAddressPage/${selectedAddress._id}`)
                }
                className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="space-y-4 my-6">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  onClick={() => setSelectedAddress(address)}
                  className={`relative border rounded-2xl p-4 cursor-pointer transition ${
                    selectedAddress?._id === address._id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="pr-8">
                      <h3 className="font-bold">{address.addressType}</h3>
                      <p className="text-sm">{address.receiverName}</p>
                      <p className="text-sm">{address.phoneNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {address.flatNo}, {address.streetArea}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 h-6 flex items-center rounded-full">
                          Default
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteAddress(e, address._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-auto"
                        title="Delete address"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/DeliveryAddressPage")}
              className="w-full border-2 border-dashed border-green-500 rounded-2xl py-4 text-green-600 font-bold hover:bg-green-50 transition-colors"
            >
              + Add New Address
            </button>
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
                <span className="font-medium text-gray-900">
                  ₹{platformFee}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>GST & Taxes</span>
                <span className="font-medium text-gray-900">
                  ₹{Math.round(gstTotal).toLocaleString("en-IN")}
                </span>
              </div>

              {packingFeeTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiPackage size={13} className="text-orange-500" />
                    Packing Charge
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{packingFeeTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-black text-gray-900 text-base">To Pay</span>
              <span className="font-black text-xl text-gray-900">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* --- PAYMENT METHOD SELECTOR --- */}
          <div className="bg-white rounded-3xl p-3 shadow-sm space-y-1">
            <h3 className="font-bold text-gray-900 px-3 pt-2 pb-1 text-sm uppercase tracking-wider">
              Payment Method
            </h3>

            {/* UPI Option */}
            <button
              onClick={() => setPaymentMethod("UPI")}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${
                paymentMethod === "UPI"
                  ? "bg-blue-50 border-blue-100"
                  : "bg-transparent hover:bg-gray-50 border-transparent"
              } border`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    paymentMethod === "UPI"
                      ? "bg-blue-200 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FiSmartphone size={20} />
                </div>
                <div className="text-left">
                  <span
                    className={`font-bold block ${
                      paymentMethod === "UPI"
                        ? "text-blue-900"
                        : "text-gray-700"
                    }`}
                  >
                    Pay via UPI
                  </span>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    GPay, PhonePe, Paytm
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === "UPI"
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                    paymentMethod === "UPI" ? "scale-100" : "scale-0"
                  }`}
                />
              </div>
            </button>

            {/* COD Option */}
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${
                paymentMethod === "COD"
                  ? "bg-green-50 border-green-100"
                  : "bg-transparent hover:bg-gray-50 border-transparent"
              } border`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    paymentMethod === "COD"
                      ? "bg-green-200 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FiCreditCard size={20} />
                </div>
                <div className="text-left">
                  <span
                    className={`font-bold block ${
                      paymentMethod === "COD"
                        ? "text-green-900"
                        : "text-gray-700"
                    }`}
                  >
                    Cash on Delivery
                  </span>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Pay at your doorstep
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === "COD"
                    ? "border-green-600"
                    : "border-gray-300"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-green-600 transition-transform duration-200 ${
                    paymentMethod === "COD" ? "scale-100" : "scale-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- BOTTOM CHECKOUT BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] rounded-t-[30px] p-4 pb-safe">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handlePlaceOrder}
            className="w-full h-[60px] bg-green-600 text-white rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all shadow-xl shadow-green-600/30 overflow-hidden relative group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex flex-col text-left">
              <span className="font-black text-lg leading-tight">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] font-medium text-green-100 uppercase tracking-wider">
                Total
              </span>
            </div>

            <div className="group flex items-center gap-2 rounded-xl bg-green-600 text-white font-semibold transition-all">
              <FiTruck size={18} />
              <span>{paymentMethod === "UPI" ? "Pay Now" : "Place Order"}</span>
              <FiChevronRight
                size={20}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
