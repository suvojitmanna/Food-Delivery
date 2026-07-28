import { useState, useEffect, useRef } from "react";
import {
  FiPackage,
  FiTruck,
  FiShoppingBag,
  FiMapPin,
  FiRefreshCcw,
  FiMoreVertical,
  FiShare2,
  FiFileText,
  FiTrash2,
  FiSearch,
  FiMic,
  FiX,
  FiClock,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import axios from "axios";

import { addToCart } from "../redux/cartSlice";
import { glassToast, serverUrl } from "../App";

const UserOrderPage = ({ orders = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const { myOrders } = useSelector((state) => state.user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".order-dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript.replace(/[.]$/, ""));
      };

      recognition.onend = () => setIsListening(false);

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSearchTerm("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getStatusBadge = (status) => {
    const baseStyle =
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all whitespace-nowrap";

    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span
            className={`${baseStyle} bg-emerald-50/80 text-emerald-700 border border-emerald-200/60`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Delivered
          </span>
        );
      case "out for delivery":
        return (
          <span
            className={`${baseStyle} bg-orange-50/80 text-orange-700 border border-orange-200/60`}
          >
            <FiTruck size={12} className="text-orange-500" />
            Out for Delivery
          </span>
        );
      case "cancelled":
        return (
          <span
            className={`${baseStyle} bg-rose-50/80 text-rose-700 border border-rose-200/60`}
          >
            <FiX size={12} className="text-rose-500" /> Cancelled
          </span>
        );
      case "partial":
      case "partially delivered":
        return (
          <span
            className={`${baseStyle} bg-purple-50/80 text-purple-700 border border-purple-200/60`}
          >
            <FiPackage size={12} className="text-purple-500" /> Partial Delivery
          </span>
        );
      case "processing":
      case "pending":
      default:
        return (
          <span
            className={`${baseStyle} bg-amber-50/80 text-amber-700 border border-amber-200/60`}
          >
            <FiClock size={12} className="text-amber-500" />{" "}
            {status || "Processing"}
          </span>
        );
    }
  };

  const handleTrackOrder = (orderId) => navigate(`/orders/track/${orderId}`);
  const handleReorderItem = (item, shop) => {
    const normalizedItem = {
      ...item,
      _id: item.item,
    };

    dispatch(addToCart({ item: normalizedItem, shop }));
    window.dispatchEvent(new Event("open-cart-sheet"));
  };

  const handleReorderAll = (order) => {
    order.shopOrders?.forEach((shopOrder) => {
      shopOrder.items?.forEach((item) => {
        const normalizedItem = {
          ...item,
          _id: item.item,
        };

        dispatch(
          addToCart({
            item: normalizedItem,
            shop: shopOrder.shop,
          }),
        );
      });
    });

    window.dispatchEvent(new Event("open-cart-sheet"));
  };

  const handleShareRestaurant = async (shop) => {
    if (!shop) return;
    const shopId = typeof shop === "object" ? shop._id : shop;
    const shopName = typeof shop === "object" ? shop.name : "Restaurant";
    const shareUrl = `${window.location.origin}/menu/${shopId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shopName,
          text: `Check out ${shopName}! 🍕`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        glassToast("Restaurant link copied!");
      }
    } catch (error) {
      console.error(error);
    }
    setActiveDropdown(null);
  };

  const handleViewOrderDetails = (orderId) => {
    navigate(`/orders/details/${orderId}`);
    setActiveDropdown(null);
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order? This action cannot be undone.",
    );

    if (!confirmDelete) {
      setActiveDropdown(null);
      return;
    }

    try {
      const { data } = await axios.delete(`${serverUrl}/api/order/${orderId}`);

      if (data.success) {
        dispatch(
          setMyOrders(myOrders.filter((order) => order._id !== orderId)),
        );
        glassToast("Order deleted successfully!");
      } else {
        glassToast(data.message || "Failed to delete order", "error");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      glassToast(
        error.response?.data?.message || "An error occurred while deleting.",
        "error",
      );
    }

    setActiveDropdown(null);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[85vh] w-full flex flex-col items-center justify-center px-4 py-8 text-center bg-slate-50 selection:bg-rose-100">
        <div className="relative mb-8 group cursor-pointer">
          <div className="absolute inset-0 bg-rose-200 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform duration-500 group-hover:scale-105">
            <FiShoppingBag
              size={42}
              className="text-slate-300 group-hover:text-rose-400 transition-colors duration-300"
            />
          </div>
        </div>
        <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          No orders yet
        </h3>
        <p className="text-slate-500 max-w-sm mb-10 text-sm sm:text-base leading-relaxed px-2">
          Looks like you haven't made your menu yet. Explore our top restaurants
          and grab a bite!
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-slate-900 hover:bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 w-full sm:w-auto active:scale-95 shadow-lg shadow-slate-900/20 hover:shadow-rose-500/30"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    if (order._id?.toLowerCase().includes(query)) return true;
    return order.shopOrders?.some((shopOrder) => {
      const matchShop = shopOrder.shop?.name?.toLowerCase().includes(query);
      const matchItem = shopOrder.items?.some((item) =>
        item.name?.toLowerCase().includes(query),
      );
      return matchShop || matchItem;
    });
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-rose-100 selection:text-rose-900 font-sans w-full overflow-x-hidden">
      {/* Premium Glassmorphic Search Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl sm:border-b border-slate-200/50 px-3 sm:px-4 py-3 sm:py-4 shadow-sm sm:shadow-[0_4px_30px_rgba(0,0,0,0.03)] sm:rounded-b-2xl">
        <div className="w-full max-w-3xl mx-auto relative flex items-center">
          <FiSearch className="absolute left-4 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search restaurant or dish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100/70 hover:bg-slate-100 pl-11 pr-24 py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 border border-transparent transition-all duration-300 font-medium text-slate-800 placeholder-slate-400"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-lg sm:rounded-xl hover:bg-slate-200/50 transition-colors"
              >
                <FiX size={16} />
              </button>
            )}
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button
              onClick={toggleListening}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                isListening
                  ? "text-rose-500 bg-rose-50 shadow-inner"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <FiMic
                size={18}
                className={isListening ? "animate-pulse scale-110" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-0 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 mt-2 sm:mt-4">
        {/* Empty Search State */}
        {filteredOrders.length === 0 && searchTerm && (
          <div className="py-24 px-4 text-center flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-5 bg-slate-100 rounded-2xl sm:rounded-3xl flex items-center justify-center rotate-3">
              <FiSearch size={28} className="text-slate-300" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              No results found
            </h4>
            <p className="text-slate-500 text-sm max-w-xs">
              We couldn't find anything matching "
              <span className="font-semibold text-slate-700 truncate inline-block max-w-[100px] align-bottom">
                {searchTerm}
              </span>
              "
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-6 text-rose-600 font-semibold text-sm hover:text-rose-700 hover:underline underline-offset-4 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.map((order) => {
          // Calculate overall status for multi-restaurant orders
          const allShopStatuses =
            order.shopOrders?.map((so) => so.status?.toLowerCase()) || [];

          let overallStatus = "processing";
          if (allShopStatuses.every((s) => s === "delivered")) {
            overallStatus = "delivered";
          } else if (allShopStatuses.every((s) => s === "cancelled")) {
            overallStatus = "cancelled";
          } else if (
            allShopStatuses.includes("delivered") ||
            allShopStatuses.includes("out for delivery")
          ) {
            overallStatus = "partial";
          } else {
            overallStatus = allShopStatuses[0] || "processing";
          }

          const primaryShop = order?.shopOrders?.[0]?.shop;
          const isFullyDeliveredOrCancelled =
            overallStatus === "delivered" || overallStatus === "cancelled";

          return (
            <div
              key={order._id}
              className="bg-white rounded-none sm:rounded-[32px] border-y sm:border border-slate-200/60 shadow-sm sm:shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:hover:-translate-y-0.5 transition-all duration-300 overflow-visible group"
            >
              {/* Order Header (Metadata & Status) */}
              <div className="p-4 sm:p-6 border-b border-slate-100/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  {/* Payment Badge */}
                  <div className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    Payment:
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        order.paymentStatus?.toLowerCase() === "paid" ||
                        order.paymentStatus?.toLowerCase() === "success"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {order.paymentMethod || "COD"}{" "}
                      <span className="text-gray-300">•</span>{" "}
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>

                  {/* Time Badge */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">
                    <FiClock size={14} className="text-gray-400" />
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "Just now"}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-xs font-mono text-slate-400 font-medium px-2 py-1 rounded-md border border-slate-100 shrink-0">
                    ID: #{order._id?.slice(-8)}
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative order-dropdown-container">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === order._id ? null : order._id,
                        )
                      }
                      className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer shrink-0"
                    >
                      <FiMoreVertical size={18} />
                    </button>

                    {activeDropdown === order._id && (
                      <div className="absolute right-0 top-full mt-2 w-48 sm:w-52 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => handleShareRestaurant(primaryShop)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <FiShare2 size={16} className="text-slate-400" />{" "}
                          Share Shop
                        </button>
                        <button
                          onClick={() => handleViewOrderDetails(order._id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <FiFileText size={16} className="text-slate-400" />{" "}
                          Order Details
                        </button>
                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                        {isFullyDeliveredOrCancelled && (
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={16} /> Delete Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shop Orders Segment */}
              <div className="divide-y divide-slate-100/80">
                {order?.shopOrders?.map((shopOrder, index) => {
                  const shopStatus = shopOrder.status?.toLowerCase();
                  const isShopDelivered = shopStatus === "delivered";
                  const isShopCancelled = shopStatus === "cancelled";

                  return (
                    <div key={index} className="p-4 sm:p-6 w-full">
                      {/* Shop Header with Specific Status */}
                      <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 gap-3 group/shop w-full">
                        <div
                          className="flex items-center gap-3 sm:gap-4 cursor-pointer flex-1 min-w-0"
                          onClick={() =>
                            navigate(`/menu/${shopOrder.shop?._id}`)
                          }
                        >
                          {shopOrder.shop?.image ? (
                            <div className="relative shrink-0">
                              <img
                                src={shopOrder.shop.image}
                                alt={shopOrder.shop.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-slate-100 shadow-sm group-hover/shop:shadow-md transition-all duration-300"
                              />
                              <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-inset ring-black/5"></div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                              <FaStore size={20} className="sm:w-6 sm:h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-lg flex items-center gap-1.5 group-hover/shop:text-rose-600 transition-colors truncate">
                              <span className="truncate">
                                {shopOrder.shop?.name || "Restaurant"}
                              </span>
                              <IoIosArrowForward
                                size={14}
                                className="text-slate-300 group-hover/shop:text-rose-500 group-hover/shop:translate-x-1 transition-all shrink-0"
                              />
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
                              {shopOrder.shop?.address ||
                                "Location unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 self-center">
                          {getStatusBadge(shopStatus)}
                        </div>
                      </div>

                      {/* Order Items List */}
                      <div className="space-y-3 sm:space-y-4">
                        {shopOrder.items?.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
                          >
                            {/* Item Image */}
                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 rounded-[12px] sm:rounded-[14px] overflow-hidden border border-slate-200/60 shrink-0 relative">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <FiPackage
                                    size={18}
                                    className="sm:w-5 sm:h-5"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0 py-0.5 sm:py-1">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug truncate">
                                  {item.name}
                                </h5>
                                <span className="font-bold text-slate-900 text-sm sm:text-base shrink-0">
                                  ₹{item.price?.toLocaleString("en-IN") || "0"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                                <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] sm:text-xs font-semibold text-slate-600">
                                  Qty: {item.quantity}
                                </div>

                                {/* Conditionally Render based on THIS specific shop order */}
                                {(isShopDelivered || isShopCancelled) && (
                                  <button
                                    onClick={() =>
                                      handleReorderItem(item, shopOrder.shop)
                                    }
                                    className="text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                  >
                                    <FiRefreshCcw size={12} />
                                    Reorder
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 sm:rounded-b-[32px] flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                <div className="w-full sm:w-auto flex justify-between sm:justify-start items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">
                    Total Paid
                  </span>
                  <span className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                  </span>
                </div>

                <div className="w-full sm:w-auto flex flex-row items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleViewOrderDetails(order._id)}
                    className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 hover:bg-white transition-all text-center active:scale-95 cursor-pointer"
                  >
                    Details
                  </button>

                  {/* Render Track if anything is still arriving, otherwise Reorder All */}
                  {isFullyDeliveredOrCancelled ? (
                    <button
                      onClick={() => handleReorderAll(order)}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] cursor-pointer"
                    >
                      <FiRefreshCcw size={16} className="shrink-0" />
                      <span>Reorder</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTrackOrder(order._id)}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] cursor-pointer"
                    >
                      <FiMapPin size={16} className="shrink-0" />
                      <span>Track</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrderPage;
