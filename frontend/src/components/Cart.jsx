import { useState, useEffect, useRef } from "react";
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
  FiTruck,
  FiEdit3,
  FiHeart,
} from "react-icons/fi";
import { addToCart, clearAllCart, removeFromCart } from "../redux/cartSlice";
import axios from "axios";
import { glassToast, serverUrl } from "../App";
import { addMyOrder } from "../redux/userSlice";
import { IoIosArrowUp } from "react-icons/io";

const Cart = () => {
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [tipAmount, setTipAmount] = useState(0);
  const [cookingInstruction, setCookingInstruction] = useState("");
  const [showAddressList, setShowAddressList] = useState(false);

  const { shopId } = useParams();
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

  const handlePlaceOrder = async () => {
    try {
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
        {
          withCredentials: true,
        },
      );

      if (data.success) {
        dispatch(clearAllCart());
        dispatch(addMyOrder(data.order));
        navigate("/order-placed", {
          state: {
            address: selectedAddress,
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
    <div className="min-h-screen bg-gray-100 pb-32 font-sans">
      {/*HEADER NAVIGATION*/}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center gap-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-900 active:scale-90 transition-transform"
          >
            <FiArrowLeft size={24} className="cursor-pointer" />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Checkout</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/*ITEMS SECTION*/}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4 pb-4 border-b border-gray-100">
            Your Order ({items.length})
          </h3>

          <div className="space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">
                        {item.name}
                      </h4>
                      <p className="text-gray-700 font-semibold text-sm mt-1">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-green-50/50 border border-green-100 rounded-lg p-1">
                      <button
                        onClick={() =>
                          dispatch(removeFromCart({ shopId, itemId: item._id }))
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-md text-red-600 bg-white shadow-sm"
                      >
                        {item.quantity === 1 ? (
                          <FiTrash2 size={14} />
                        ) : (
                          <FiMinus size={14} />
                        )}
                      </button>
                      <span className="font-bold text-sm text-red-600 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(addToCart(item))}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-red-600 bg-white shadow-sm"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Mock Addon details to match wireframe */}
                  {item.addons && (
                    <p className="text-gray-500 text-xs mt-1">Extra Cheese</p>
                  )}
                  <div className="border-b border-gray-100 pb-2"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate(`/menu/${shopId}`)}
            className="w-full mt-2 py-3 text-green-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50 rounded-xl transition-colors border-dotted"
          >
            <FiPlus /> Add More Items
          </button>
        </div>

        {/*COUPON SECTION*/}
        <button className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <FiTag className="text-blue-600" size={20} />
            <span className="font-bold text-gray-800">Apply Coupon</span>
          </div>
          <FiChevronRight className="text-gray-400" size={20} />
        </button>

        {/*DELIVERY ADDRESS*/}
        <div
          ref={addressContainerRef}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          {!showAddressList ? (
            /*COMPACT VIEW (Selected Address)*/
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-orange-500">
                  <FiMapPin size={22} />
                </div>
                {selectedAddress ? (
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {selectedAddress.addressType || "Home"}
                    </h3>
                    <p className="text-gray-800 font-medium text-sm mt-1">
                      {selectedAddress.receiverName} •{" "}
                      {selectedAddress.mobileNumber}
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">
                      {selectedAddress.flatNo}, {selectedAddress.streetArea}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium pt-1">
                    No Address Selected
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAddressList(true)}
                className="text-orange-600 font-bold text-sm hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            /*All Addresses*/
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiMapPin className="text-orange-500" size={18} />
                  Select Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressList(false)}
                  className="text-gray-500 text-sm font-medium hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`relative flex items-start justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                      selectedAddress?._id === address._id
                        ? "border-orange-500 bg-orange-50/50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddressList(false);
                    }}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {address.addressType || "Home"}
                        </h4>
                        {address.isDefault && (
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium text-xs mt-1">
                        {address.receiverName} • {address.mobileNumber}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                        {address.flatNo}, {address.streetArea}
                      </p>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/DeliveryAddressPage/${address._id}`);
                      }}
                      className="p-2 text-gray-400 hover:text-orange-600 bg-white rounded-lg border border-gray-100 shadow-sm transition-colors"
                    >
                      <FiEdit3 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Address Button */}
              <button
                onClick={() => navigate("/DeliveryAddressPage")}
                className="w-full py-3 mt-2 border-2 border-dashed border-orange-300 text-orange-600 bg-orange-50/30 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors"
              >
                + Add New Address
              </button>
            </div>
          )}
        </div>

        {/*INSTRUCTIONS FOR RESTAURANT*/}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
            <FiEdit3 size={18} />
            <h3>Instructions for Restaurant</h3>
          </div>
          <textarea
            value={cookingInstruction}
            onChange={(e) => setCookingInstruction(e.target.value)}
            placeholder="E.g. Less spicy, No onion, Add utensils..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none h-20"
          ></textarea>
        </div>

        {/*TIP DELIVERY PARTNER*/}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col mb-4">
            <div className="flex items-center gap-2 text-gray-900 font-black text-lg">
              <h3>Say thanks with a tip</h3>
              <FiHeart className="text-green-500 fill-green-500" size={20} />
            </div>
            <span className="text-xs text-gray-500 mt-1 font-medium">
              100% of the tip goes to your delivery partner
            </span>
          </div>

          <div className="flex gap-4 overflow-visible pt-5">
            {[20, 30, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => setTipAmount(amount === tipAmount ? 0 : amount)}
                className={`relative w-[88px] h-20 rounded-2xl border-2 flex items-center justify-center flex-col font-bold transition-all duration-300 ${
                  tipAmount === amount
                    ? "bg-green-50 border-green-500 text-green-600 shadow-sm"
                    : "bg-white border-gray-100 text-gray-700 hover:border-gray-200"
                }`}
              >
                {amount === 50 && tipAmount !== 50 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="bg-orange-50 border border-orange-200 rounded-full px-3 py-1 shadow-sm">
                      <span className="text-orange-500 text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap">
                        🔥 Popular
                      </span>
                    </div>
                  </div>
                )}
                <span className="text-xl">₹{amount}</span>
              </button>
            ))}

            <button className="flex-shrink-0 w-[88px] h-20 rounded-2xl font-semibold border-2 border-gray-100 text-gray-600 bg-white hover:border-gray-200 transition-colors flex items-center justify-center">
              Custom
            </button>
          </div>
        </div>

        {/* BILL DETAILS ACCORDION */}
        <div
          className="relative w-full overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm"
          ref={billRef}
        >
          <button
            onClick={() => setShowBill(!showBill)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors z-10 relative bg-white"
          >
            <span className="font-semibold text-gray-800 tracking-wide">
              View Bill Details
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#ff4d2d]">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
              <IoIosArrowUp
                className={`text-gray-500 transition-transform duration-300 ${
                  showBill ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          <AnimatePresence>
            {showBill && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-100 bg-white"
              >
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Item Total</span>
                    <span>₹{itemTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>GST</span>
                    <span>₹{Math.round(gstTotal).toLocaleString("en-IN")}</span>
                  </div>

                  {packingFeeTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Packing</span>
                      <span>₹{packingFeeTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="text-blue-600 font-bold">FREE</span>
                  </div>

                  {tipAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Tip</span>
                      <span>₹{tipAmount}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
                    <span className="font-black text-gray-900 text-base">
                      Total
                    </span>
                    <span className="font-black text-xl text-gray-900">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CANCELLATION POLICY */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mt-2">
          <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1.5">
            Cancellation Policy
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed font-medium">
            A 100% cancellation charge will apply. This helps us compensate the
            restaurant partner for food preparation.
          </p>
        </div>
      </div>

      {/* PAYMENT OPTIONS POPOVER */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100  pb-safe shadow-[0_-8px_20px_-15px_rgba(0,0,0,0.15)] pl-5 pr-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="relative flex-[1]" ref={paymentMenuRef}>
            <div
              onClick={() => setShowPaymentMenu(!showPaymentMenu)}
              className="flex flex-col cursor-pointer p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                Pay Using <span className="w-1 h-1 rounded-full bg-gray-300" />{" "}
                {paymentMethod === "COD" ? "Cash" : "Online"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl sm:text-2xl text-gray-900">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
                <IoIosArrowUp
                  className="text-gray-900 text-lg transition-transform duration-300"
                  style={{
                    transform: showPaymentMenu
                      ? "rotate(0deg)"
                      : "rotate(180deg)",
                  }}
                />
              </div>
            </div>

            {/* PAYMENT OPTIONS POPOVER */}
            <AnimatePresence>
              {showPaymentMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-4 left-0 w-64 bg-white rounded-3xl p-3 shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                  <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2 px-3 pt-1">
                    Payment Options
                  </h3>
                  <div className="space-y-1">
                    {["Online", "COD"].map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setPaymentMethod(method);
                          setShowPaymentMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                          paymentMethod === method
                            ? "bg-green-50 border border-green-100"
                            : "bg-white hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <span
                          className={`font-bold text-sm ${
                            paymentMethod === method
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          {method === "COD" ? "Cash on Delivery" : "Pay Online"}
                        </span>
                        {paymentMethod === method && (
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTION BUTTON (Right Side) */}
          <button
            onClick={handlePlaceOrder}
            className="flex-[1.2] h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-between px-5 font-bold active:scale-[0.97] transition-all shadow-lg shadow-green-600/30 cursor-pointer"
          >
            <span className="text-base sm:text-lg">
              {paymentMethod === "COD" ? "Place Order" : "Proceed to Pay"}
            </span>
            <FiChevronRight className="text-xl stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
