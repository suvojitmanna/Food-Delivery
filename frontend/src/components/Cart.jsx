import { useState, useEffect, useRef, useMemo } from "react";
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
  FiMapPin,
  FiTag,
  FiEdit3,
  FiInfo,
} from "react-icons/fi";
import { addToCart, clearAllCart, removeFromCart } from "../redux/cartSlice";
import axios from "axios";
import { glassToast, serverUrl } from "../App";
import { addMyOrder } from "../redux/userSlice";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";

const VegIcon = () => (
  <div className="w-3.5 h-3.5 border border-[#24963F] flex items-center justify-center rounded-[2px] shrink-0 mt-0.5">
    <div className="w-1.5 h-1.5 bg-[#24963F] rounded-full"></div>
  </div>
);

const Cart = () => {
  const { id, shopId } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [tipAmount, setTipAmount] = useState(0);
  const [cookingInstruction, setCookingInstruction] = useState("");
  const [showAddressList, setShowAddressList] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const billRef = useRef(null);

  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const paymentMenuRef = useRef(null);
  const addressContainerRef = useRef(null);

  const cart = useSelector((state) => state.cart.carts[shopId]);
  const { shopInMyCity, userData } = useSelector((state) => state.user);

  const shop = shopInMyCity?.find((item) => item._id === (id || shopId));

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        paymentMenuRef.current &&
        !paymentMenuRef.current.contains(e.target)
      ) {
        setShowPaymentMenu(false);
      }
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(e.target)
      ) {
        setShowAddressList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
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
        console.log("Failed to fetch addresses:", error);
      }
    };
    getAddresses();
  }, []);

  const calculatedDistanceInfo = useMemo(() => {
    if (
      !shop?.location?.latitude ||
      !shop?.location?.longitude ||
      !selectedAddress?.latitude ||
      !selectedAddress?.longitude
    ) {
      return {
        distance: "0 km",
        time: "30-40 mins",
      };
    }

    const R = 6371;

    const shopLat = Number(shop.location.latitude);
    const shopLng = Number(shop.location.longitude);

    const addressLat = Number(selectedAddress.latitude);
    const addressLng = Number(selectedAddress.longitude);

    const dLat = ((addressLat - shopLat) * Math.PI) / 180;

    const dLng = ((addressLng - shopLng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((shopLat * Math.PI) / 180) *
        Math.cos((addressLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return {
      distance: `${distance.toFixed(1)} km`,
      time:
        distance <= 7
          ? `${shop?.deliveryTime || "30-40"} mins`
          : "Not available",
    };
  }, [shop, selectedAddress]);

  if (!cart || !cart.items || Object.keys(cart.items).length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-300 mb-6"
        >
          <FiShoppingBag size={50} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-[280px]">
          Good food is always cooking! Go ahead, order some yummy items from the
          menu.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#E23744] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-all"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();

    try {
      const { data } = await axios.delete(
        `${serverUrl}/api/delivery-address/${addressId}`,
        { withCredentials: true },
      );

      if (data.success) {
        glassToast("Address deleted successfully", "success");
        const updatedAddresses = addresses.filter((a) => a._id !== addressId);
        setAddresses(updatedAddresses);
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(updatedAddresses[0] || null);
        }
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      glassToast(
        error.response?.data?.message || "Failed to delete address.",
        "error",
      );
    }
  };

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
  const couponDiscount = 0;

  const grandTotal = Math.round(
    itemTotal +
      platformFee +
      gstTotal +
      packingFeeTotal +
      deliveryFee +
      tipAmount -
      couponDiscount,
  );

  const shopDistance = useMemo(() => {
    if (
      !shop?.location?.latitude ||
      !shop?.location?.longitude ||
      !selectedAddress?.latitude ||
      !selectedAddress?.longitude
    ) {
      return null;
    }

    const R = 6371;

    const lat1 = Number(shop.location.latitude);
    const lon1 = Number(shop.location.longitude);

    const lat2 = Number(selectedAddress.latitude);
    const lon2 = Number(selectedAddress.longitude);

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, [shop, selectedAddress]);

  const deliveryAvailable = shopDistance !== null && shopDistance <= 7;

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress) {
        glassToast("Please select a delivery address.", "error");

        navigate("/DeliveryAddressPage");
        return;
      }
      if (!selectedAddress) {
        glassToast("Please select a delivery address.", "error");
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
        deliveryAddress: selectedAddress._id,
        totalAmount: grandTotal,
        tipAmount,
        cookingInstruction,
      };

      const { data } = await axios.post(
        `${serverUrl}/api/order/place-order`,
        payload,
        { withCredentials: true },
      );

      if (data.success) {
        dispatch(clearAllCart());
        dispatch(addMyOrder(data.order));

        navigate("/order-placed", {
          state: {
            address: selectedAddress,
            orderId: data.order._id,
          },
        });
      }
    } catch (error) {
      glassToast(
        error.response?.data?.message || "Failed to place order.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] pb-32 font-sans text-gray-800 selection:bg-red-100">
      {/* HEADER  */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Left Side*/}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 active:scale-90 transition-transform"
          >
            <FiArrowLeft size={24} className="text-gray-800" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-tight truncate max-w-[180px] sm:max-w-[300px]">
              {shop?.name || "Checkout"}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#24963F]"></span>
              {calculatedDistanceInfo.distance} • {calculatedDistanceInfo.time}
            </p>
          </div>
        </div>

        {/* Right Side*/}
        <div className="flex flex-col items-center bg-[#24963F] text-white rounded-xl shadow-sm overflow-hidden shrink-0">
          <div className="px-3 py-1.5 flex items-center gap-1 font-bold text-base sm:text-lg">
            {shop?.rating || "4.2"} <FaStar className="text-[12px]" />
          </div>
          <div className="bg-white text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 w-full text-center border-t border-gray-100">
            {shop?.totalReviews >= 1000
              ? `${(shop.totalReviews / 1000).toFixed(1)}k`
              : shop?.totalReviews || "1k+"}{" "}
            Ratings
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4">
        {/* DELIVERY ADDRESS CARD */}
        <div
          ref={addressContainerRef}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          {!showAddressList ? (
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-[#f4f4f5] p-2 rounded-lg text-[#E23744] mt-0.5">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                    Delivering to {selectedAddress?.addressType || "Home"}
                  </h3>
                  {selectedAddress ? (
                    <>
                      <p className="text-gray-500 text-sm mt-0.5 line-clamp-1 font-medium">
                        {selectedAddress.flatNo}, {selectedAddress.streetArea}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {selectedAddress.receiverName} •{" "}
                        {selectedAddress.mobileNumber}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">
                      No Address Selected
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAddressList(true)}
                className="text-[#E23744] font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform cursor-pointer border-2 border-dotted"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Choose a delivery address
                </h3>
                <button
                  onClick={() => setShowAddressList(false)}
                  className="text-gray-400 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <FiArrowLeft size={20} className="rotate-180" />
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`relative flex items-start justify-between p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      selectedAddress?._id === address._id
                        ? "border-[#E23744] bg-red-50/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddressList(false);
                    }}
                  >
                    <div className="flex gap-3">
                      <FiMapPin
                        className={`mt-1 ${
                          selectedAddress?._id === address._id
                            ? "text-[#E23744]"
                            : "text-gray-400"
                        }`}
                        size={18}
                      />
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {address.addressType || "Home"}
                          </h4>
                        </div>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                          {address.flatNo}, {address.streetArea}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 font-medium">
                          {address.mobileNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/DeliveryAddressPage?edit=${address._id}`);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-[#E23744] bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                        title="Edit Address"
                      >
                        <TbEdit size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteAddress(e, address._id)}
                        className="px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                        title="Delete Address"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/DeliveryAddressPage")}
                className="w-full py-3 mt-2 border-2 border-dotted border-orange-300 text-orange-600 bg-orange-50/30 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors"
              >
                + Add New Address
              </button>
            </div>
          )}
        </div>

        {/* ITEMS SECTION */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="space-y-5">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {item.image && (
                        <div className="w-15 h-15 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex mt-3 items-center">
                          <VegIcon size={10} />
                          <h4 className="font-semibold pl-1 text-gray-800 text-sm leading-snug">
                            {item.name}
                          </h4>
                        </div>
                        {item.addons && (
                          <p className="text-gray-400 text-xs mt-1">
                            {item.addons}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center bg-[#FFF1F2] border border-[#F43F5E] rounded-lg overflow-hidden shadow-sm h-8">
                        <button
                          onClick={() =>
                            dispatch(
                              removeFromCart({ shopId, itemId: item._id }),
                            )
                          }
                          className="w-8 h-full flex items-center justify-center text-[#E23744] active:bg-red-100 transition-colors"
                        >
                          {item.quantity === 1 ? (
                            <FiTrash2 size={14} />
                          ) : (
                            <FiMinus size={14} />
                          )}
                        </button>
                        <span className="font-bold text-sm text-[#E23744] w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(addToCart(item))}
                          className="w-8 h-full flex items-center justify-center text-[#E23744] active:bg-red-100 transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-sm text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  {shopDistance !== null && (
                    <div className="mt-1.5">
                      {deliveryAvailable ? (
                        <p className="text-[11px] font-bold text-green-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Delivery available • {shopDistance.toFixed(1)} km
                        </p>
                      ) : (
                        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Not deliverable • {shopDistance.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                  )}
                  <div className="border-b border-gray-100 border-dashed mt-2"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate(`/menu/${shopId}`)}
            className="w-full mt-2 py-3 flex items-center justify-center gap-2 border-2 border-dashed border-red-300 text-orange-600 bg-orange-50/50 rounded-xl font-bold text-sm hover:bg-red-100 hover:border-red-400 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <FiPlus size={18} className="stroke-[3]" />
            Add more items
          </button>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <FiEdit3 className="text-gray-400 mt-1" size={18} />
            <div className="flex-1">
              <input
                type="text"
                value={cookingInstruction}
                onChange={(e) => setCookingInstruction(e.target.value)}
                placeholder="Add cooking instructions"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <div className="h-[1px] w-full bg-gray-200 mt-2 transition-colors focus-within:bg-[#E23744]"></div>
            </div>
          </div>
        </div>

        {/* OFFERS / COUPONS */}
        <button className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-full text-blue-600">
              <FiTag size={18} />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-gray-800 block text-sm">
                View offers / Apply coupon
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Unlock exclusive discounts
              </span>
            </div>
          </div>
          <FiChevronRight className="text-gray-400" size={20} />
        </button>

        {/* TIP DELIVERY PARTNER */}
        <div className="flex gap-3 overflow-visible pt-3 pb-2 scrollbar-hide">
          {[20, 30, 50].map((amount) => (
            <button
              key={amount}
              onClick={() => setTipAmount(amount === tipAmount ? 0 : amount)}
              className={`flex-shrink-0 relative w-20 h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                tipAmount === amount
                  ? "bg-red-50 border-[#E23744] text-[#E23744]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              {/* Popular Badge for 30 */}
              {amount === 30 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 shadow-sm whitespace-nowrap">
                    <span className="text-orange-600 text-[10px] font-bold flex items-center gap-1 animate-bounce">
                      🔥 Popular
                    </span>
                  </div>
                </div>
              )}
              ₹{amount}
            </button>
          ))}

          <button className="flex-shrink-0 w-20 h-12 rounded-xl font-semibold border border-gray-200 text-gray-600 bg-white hover:border-gray-300 transition-colors flex items-center justify-center text-sm">
            Custom
          </button>
        </div>

        {/* BILL DETAILS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm" ref={billRef}>
          <button
            onClick={() => setShowBill(!showBill)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="font-extrabold text-gray-800 text-sm">
              Bill Details
            </span>

            <div className="flex items-center gap-2">
              {!showBill && (
                <span className="font-extrabold text-red-600 text-sm">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              )}

              {/* Toggle Arrows */}
              {showBill ? (
                <IoIosArrowUp className="text-gray-500 text-lg" />
              ) : (
                <IoIosArrowDown className="text-gray-500 text-lg" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {showBill && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3 text-sm text-gray-600 font-medium">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span>₹{itemTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 cursor-pointer border-b border-dashed border-gray-400">
                      Delivery fee for {calculatedDistanceInfo.distance}
                    </span>
                    {deliveryFee === 0 ? (
                      <div className="flex gap-2">
                        <span className="line-through text-gray-400">₹40</span>
                        <span className="text-blue-600 font-bold">FREE</span>
                      </div>
                    ) : (
                      <span>₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>GST and Restaurant Charges</span>
                    <span>
                      ₹
                      {Math.round(gstTotal + packingFeeTotal).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>

                  {tipAmount > 0 && (
                    <div className="flex justify-between text-gray-800">
                      <span>Delivery Tip</span>
                      <span>₹{tipAmount}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Item Discount</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="my-2 border-t border-gray-200 border-dashed"></div>

                  <div className="flex justify-between items-center pb-1">
                    <span className="font-extrabold text-gray-900 text-base">
                      To Pay
                    </span>
                    <span className="font-extrabold text-red-600 text-base">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CANCELLATION POLICY */}
        <div className="bg-gray-100 rounded-xl p-4 flex gap-3 items-start">
          <FiInfo className="text-gray-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-700 text-xs mb-1">
              Review your order and address details to avoid cancellations
            </h3>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              <span className="text-red-500 font-semibold">Note:</span> If you
              choose to cancel, you can do it within 60 seconds after placing
              order. A 100% cancellation fee will be applicable afterwards.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR*/}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-3 sm:p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.15)] rounded-t-2xl">
        <div
          className="max-w-2xl mx-auto flex items-center justify-between gap-3 relative"
          ref={paymentMenuRef}
        >
          {/* Payment Method Selector */}
          <div
            onClick={() => setShowPaymentMenu(!showPaymentMenu)}
            className="flex flex-col cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 min-w-[120px] border-2 border-dotted border-green-600"
          >
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Pay Using{" "}
              <IoIosArrowUp
                className={`transition-transform duration-200 ${showPaymentMenu ? "rotate-180" : ""}`}
              />
            </div>
            <div className="font-black text-sm text-gray-900 mt-0.5">
              {paymentMethod === "COD" ? "Cash" : "Online"}
            </div>
          </div>

          {/* Payment Popup */}
          <AnimatePresence>
            {showPaymentMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-3 left-0 w-64 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-50"
              >
                <div className="p-2 pb-1 border-b border-gray-50 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm">
                    Select Payment Method
                  </h3>
                </div>
                {["Online", "COD"].map((method) => (
                  <button
                    key={method}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentMethod(method);
                      setShowPaymentMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                      paymentMethod === method
                        ? "bg-red-50/50 text-[#E23744]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-bold text-sm">
                      {method === "COD" ? "Cash on Delivery" : "Pay Online"}
                    </span>
                    {paymentMethod === method && (
                      <div className="w-4 h-4 rounded-full border-4 border-[#E23744]"></div>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={!deliveryAvailable}
            className={`flex-1 rounded-xl py-3.5 px-4 font-bold ${
              deliveryAvailable
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {deliveryAvailable ? "Place Order" : "Not available for delivery"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
