import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  FiHeart,
} from "react-icons/fi";
import { addToCart, clearAllCart, removeFromCart } from "../redux/cartSlice";
import axios from "axios";
import { serverUrl } from "../App";

const MultiCart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [tipAmount, setTipAmount] = useState(0);
  const [cookingInstruction, setCookingInstruction] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);

  const addressContainerRef = useRef(null);

  // Fetch ALL carts from Redux
  const allCarts = useSelector((state) => state.cart.carts);

  // Filter out empty carts and format as an array of [shopId, cartData]
  const activeCarts = Object.entries(allCarts || {}).filter(
    ([, cart]) => cart.items && Object.keys(cart.items).length > 0
  );

  // Click outside listener for addresses
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(event.target)
      ) {
        setShowAddressList(false);
      }
    };
    if (showAddressList) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddressList]);

  // Fetch Delivery Addresses
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

  // Early return if EVERYTHING is empty
  if (activeCarts.length === 0) {
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
          Looks like you haven't added anything to your cart yet.
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

  // --- GLOBAL CALCULATIONS ---
  let globalItemTotal = 0;
  let globalGstTotal = 0;
  let globalPackingFeeTotal = 0;
  const orderItems = [];

  activeCarts.forEach(([shopId, cart]) => {
    Object.values(cart.items).forEach((item) => {
      globalItemTotal += item.price * item.quantity;
      globalGstTotal +=
        (item.price * item.quantity * (Number(item.gst) || 0)) / 100;
      globalPackingFeeTotal += item.hasPackingFee ? 10 * item.quantity : 0;

      orderItems.push({
        _id: item._id,
        shop: shopId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      });
    });
  });

  const platformFee = 8 * activeCarts.length;
  const deliveryFee = 0;
  const couponDiscount = 0;

  const grandTotal = Math.round(
    globalItemTotal +
      platformFee +
      globalGstTotal +
      globalPackingFeeTotal +
      deliveryFee +
      tipAmount -
      couponDiscount
  );

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress) {
        alert("Please select a delivery address.");
        navigate("/DeliveryAddressPage");
        return;
      }

      const payload = {
        cartItems: orderItems,
        paymentMethod: paymentMethod === "COD" ? "cod" : "online",
        deliveryAddress: selectedAddress,
        totalAmount: grandTotal,
        tipAmount,
        cookingInstruction,
      };

      const { data } = await axios.post(
        `${serverUrl}/api/order/place-order`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        dispatch(clearAllCart())
        alert("Order placed successfully!");
        navigate("/order");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-32 font-sans">
      {/* --- HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center gap-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-900 active:scale-90 transition-transform"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Checkout</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* --- DELIVERY ADDRESS --- */}
        <div
          ref={addressContainerRef}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          {!showAddressList ? (
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
                className="text-orange-600 font-bold text-sm hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiMapPin className="text-orange-500" size={18} />
                  Select Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressList(false)}
                  className="text-gray-500 text-sm font-medium hover:text-gray-800"
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

              <button
                onClick={() => navigate("/DeliveryAddressPage")}
                className="w-full py-3 mt-2 border-2 border-dashed border-orange-300 text-orange-600 bg-orange-50/30 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors"
              >
                + Add New Address
              </button>
            </div>
          )}
        </div>

        {/* --- MULTIPLE RESTAURANTS BLOCKS --- */}
        {activeCarts.map(([shopId, cart]) => {
          const shopItems = Object.values(cart.items);
          const shopSubtotal = shopItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div
              key={shopId}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="font-black text-gray-900 text-lg">
                  {cart.shop?.name || "Restaurant"}
                </h3>
                <button
                  onClick={() => navigate(`/shop/${shopId}`)}
                  className="text-orange-600 text-sm font-bold hover:underline"
                >
                  Add items
                </button>
              </div>

              <div className="space-y-5">
                <AnimatePresence>
                  {shopItems.map((item) => (
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
                        <div className="flex items-center gap-3 bg-red-50/50 border border-red-100 rounded-lg p-1">
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
                            onClick={() => dispatch(addToCart({ ...item, shopId }))}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-red-600 bg-white shadow-sm"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                      {/* Optional: Addon Details */}
                      {item.addons && (
                        <p className="text-gray-500 text-xs mt-1">
                          {item.addons}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Shop Subtotal */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center text-sm font-bold text-gray-700">
                <span>Subtotal</span>
                <span>₹{shopSubtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          );
        })}

        {/* --- COUPON SECTION --- */}
        <button className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <FiTag className="text-blue-600" size={20} />
            <span className="font-bold text-gray-800">Apply Coupon</span>
          </div>
          <FiChevronRight className="text-gray-400" size={20} />
        </button>

        {/* --- INSTRUCTIONS FOR RESTAURANT --- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
            <FiEdit3 size={18} />
            <h3>Instructions</h3>
          </div>
          <textarea
            value={cookingInstruction}
            onChange={(e) => setCookingInstruction(e.target.value)}
            placeholder="E.g. Less spicy, No onion, Add utensils..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none h-20"
          ></textarea>
        </div>

        {/* --- TIP DELIVERY PARTNER --- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
            <FiHeart className="text-red-500 fill-red-500" size={18} />
            <h3>Tip your Delivery Partner</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[20, 30, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => setTipAmount(amount === tipAmount ? 0 : amount)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border transition-colors ${
                  tipAmount === amount
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                ₹{amount}
              </button>
            ))}
            <button className="flex-shrink-0 px-5 py-2 rounded-xl font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
              Custom
            </button>
          </div>
        </div>

        {/* --- PAYMENT METHOD --- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {["UPI", "Card", "Wallet", "COD"].map((method) => (
              <label
                key={method}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === method
                    ? "border-green-500 bg-green-50/50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="font-bold text-gray-700 text-sm">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* --- BILL SUMMARY --- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Bill Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span>₹{globalItemTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>GST</span>
              <span>₹{Math.round(globalGstTotal).toLocaleString("en-IN")}</span>
            </div>

            {globalPackingFeeTotal > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Packing</span>
                <span>₹{globalPackingFeeTotal.toLocaleString("en-IN")}</span>
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
              <span className="font-black text-gray-900 text-base">Total</span>
              <span className="font-black text-xl text-gray-900">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- STICKY FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 pb-safe">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-black text-xl leading-tight">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-green-600 uppercase">
              Total
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="flex-1 h-14 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-green-600/20"
          >
            Place Order <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiCart;