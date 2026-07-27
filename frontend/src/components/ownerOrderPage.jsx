import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiShoppingBag,
  FiPackage,
  FiSettings,
  FiBox,
  FiTruck,
  FiTrendingUp,
  FiPieChart,
  FiX,
  FiMic,
  FiMicOff,
  FiNavigation,
  FiUser,
} from "react-icons/fi";
import {
  MdPhone,
  MdLocationOn,
  MdHomeWork,
  MdDirectionsBike,
} from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateTime = (distanceKm, avgSpeedKmh = 30) => {
  if (!distanceKm) return null;
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60);
};

const StatusBadge = ({ status }) => {
  const baseClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm capitalize transition-colors";

  switch (status?.toLowerCase()) {
    case "accepted":
      return (
        <span
          className={`${baseClass} bg-blue-50 text-blue-600 border border-blue-100`}
        >
          <FiCheckCircle size={14} /> Accepted
        </span>
      );
    case "preparing":
      return (
        <span
          className={`${baseClass} bg-purple-50 text-purple-600 border border-purple-100`}
        >
          <FiSettings size={14} /> Preparing
        </span>
      );
    case "ready":
      return (
        <span
          className={`${baseClass} bg-teal-50 text-teal-600 border border-teal-100`}
        >
          <FiPackage size={14} /> Ready
        </span>
      );
    case "picked":
      return (
        <span
          className={`${baseClass} bg-indigo-50 text-indigo-600 border border-indigo-100`}
        >
          <FiBox size={14} /> Picked
        </span>
      );
    case "out for delivery":
      return (
        <span
          className={`${baseClass} bg-orange-50 text-orange-600 border border-orange-100`}
        >
          <FiTruck size={14} /> Out for Delivery
        </span>
      );
    case "delivered":
      return (
        <span
          className={`${baseClass} bg-green-50 text-green-600 border border-green-100`}
        >
          <FiCheckCircle size={14} /> Delivered
        </span>
      );
    case "cancelled":
      return (
        <span
          className={`${baseClass} bg-rose-50 text-rose-600 border border-rose-100`}
        >
          <FiXCircle size={14} /> Cancelled
        </span>
      );
    case "pending":
    default:
      return (
        <span
          className={`${baseClass} bg-amber-50 text-amber-600 border border-amber-100`}
        >
          <FiClock size={14} /> Pending
        </span>
      );
  }
};

const getAvailableStatusOptions = (currentStatus) => {
  const status = (currentStatus || "pending").toLowerCase();

  const allStatuses = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "out for delivery", label: "Out for Delivery" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (status === "delivered")
    return [{ value: "delivered", label: "Delivered" }];
  if (status === "cancelled")
    return allStatuses.filter((s) => s.value === "cancelled");
  if (status === "out for delivery")
    return allStatuses.filter((s) => s.value === "out for delivery");

  const flow = [
    "pending",
    "accepted",
    "preparing",
    "ready",
    "out for delivery",
  ];
  const currentIndex = flow.indexOf(status);

  return allStatuses.filter((s) => {
    if (s.value === "cancelled") return true;
    const index = flow.indexOf(s.value);
    return index >= currentIndex;
  });
};

const OwnerOrderPage = ({ orders = [] }) => {
  // Changed to a dictionary to store available boys per order ID
  const [availableBoysMap, setAvailableBoysMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasSpeechSupport(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setSearchTerm(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSearchTerm("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const summaryStats = useMemo(() => {
    let totalOrders = orders.length;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      const status = order.shopOrders?.[0]?.status?.toLowerCase() || "pending";

      if (status === "delivered") {
        deliveredCount++;
        const items = order.shopOrders?.[0]?.items || [];
        const orderTotal = items.reduce(
          (acc, item) => acc + item.quantity * (item.price || 199),
          0,
        );
        totalRevenue += orderTotal;
      }

      if (status === "cancelled") {
        cancelledCount++;
      }
    });

    const deliveredPct =
      totalOrders === 0 ? 0 : Math.round((deliveredCount / totalOrders) * 100);
    const cancelledPct =
      totalOrders === 0 ? 0 : Math.round((cancelledCount / totalOrders) * 100);

    return { totalOrders, deliveredPct, cancelledPct, totalRevenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.shopOrders?.[0]?.status?.toLowerCase() || "pending";
      const matchesFilter =
        activeFilter === "All" || status === activeFilter.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const customerName =
        order.deliveryAddress?.receiverName?.toLowerCase() || "";
      const orderId = order._id?.toLowerCase() || "";

      const matchesSearch =
        orderId.includes(searchLower) || customerName.includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveFilter("All");
  };

  const isFiltering = searchTerm !== "" || activeFilter !== "All";

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return { text: "text-blue-600", border: "border-blue-200" };
      case "preparing":
        return { text: "text-purple-600", border: "border-purple-200" };
      case "ready":
        return { text: "text-teal-600", border: "border-teal-200" };
      case "picked":
        return { text: "text-indigo-600", border: "border-indigo-200" };
      case "out for delivery":
        return { text: "text-orange-600", border: "border-orange-200" };
      case "delivered":
        return { text: "text-green-600", border: "border-green-200" };
      case "cancelled":
        return { text: "text-rose-600", border: "border-rose-200" };
      case "pending":
      default:
        return { text: "text-amber-600", border: "border-amber-200" };
    }
  };

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));

      // Save available boys specifically for this order
      if (result.data.availableBoys) {
        setAvailableBoysMap((prev) => ({
          ...prev,
          [orderId]: result.data.availableBoys,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Modified to accept orderId to match the new dictionary pattern
  const getAssignment = async (assignmentId, orderId) => {
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/order/assignment/${assignmentId}`,
        { withCredentials: true },
      );

      if (data.success) {
        setAvailableBoysMap((prev) => ({
          ...prev,
          [orderId]: data.assignment.broadcastedTo,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadAssignments = async () => {
      for (const order of orders) {
        const shopOrder = order.shopOrders?.[0];

        if (shopOrder?.status === "out for delivery" && shopOrder?.assignment) {
          await getAssignment(shopOrder.assignment, order._id);
        }
      }
    };

    if (orders.length > 0) {
      loadAssignments();
    }
  }, [orders]);

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6 sm:space-y-8 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 sm:p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <FiShoppingBag className="text-white" size={20} />
            </div>
            Store Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium ml-1">
            Manage, track, and update customer orders efficiently.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {isFiltering && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 w-full sm:w-auto justify-center text-sm font-semibold text-gray-600 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all shadow-sm border border-gray-200 hover:border-rose-200"
            >
              <FiX size={16} /> Clear
            </button>
          )}

          <div className="relative w-full sm:w-72 group">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 ${
                hasSpeechSupport ? "pr-12" : "pr-4"
              } py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-medium transition-all placeholder:text-gray-400`}
            />
            {hasSpeechSupport && (
              <button
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 ${
                  isListening
                    ? "bg-rose-100 text-rose-600 animate-pulse"
                    : "text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                }`}
                title={isListening ? "Listening..." : "Search by voice"}
              >
                {isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
              </button>
            )}
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-semibold text-gray-700 cursor-pointer transition-all appearance-none"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <FiPackage className="text-indigo-600" size={16} />
            </div>
            <span className="text-xs sm:text-sm font-semibold">
              Total Orders
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-800">
            {summaryStats.totalOrders}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <FiPieChart className="text-green-600" size={16} />
            </div>
            <span className="text-xs sm:text-sm font-semibold">Delivered</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-800">
            {summaryStats.deliveredPct}%
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <FiXCircle className="text-rose-600" size={16} />
            </div>
            <span className="text-xs sm:text-sm font-semibold">Cancelled</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-800">
            {summaryStats.cancelledPct}%
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <FiTrendingUp className="text-amber-600" size={16} />
            </div>
            <span className="text-xs sm:text-sm font-semibold">Revenue</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-800 truncate">
            ₹{summaryStats.totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => {
            const shopOrder = order.shopOrders?.[0] || {};
            const status = shopOrder.status || "pending";
            const date = new Date(order.createdAt || Date.now());
            const address = order.deliveryAddress || {};
            const items = shopOrder.items || [];

            const orderTotal = items.reduce(
              (acc, item) => acc + item.quantity * (item.price || 199),
              0,
            );
            const { text: statusTextColor, border: statusBorderColor } =
              getStatusStyle(status);

            const distanceKm = calculateDistance(
              shopOrder?.shop?.location?.latitude,
              shopOrder?.shop?.location?.longitude,
              address?.latitude,
              address?.longitude,
            );
            const estimatedMins = calculateTime(distanceKm);

            const availableOptions = getAvailableStatusOptions(
              shopOrder.status,
            );
            const isLocked = availableOptions.length <= 1;

            // Retrieve available boys specifically for this order
            const orderAvailableBoys = availableBoysMap[order._id] || [];

            return (
              <div
                key={order._id || `fallback-order-${index}`}
                className="flex flex-col p-4 sm:pl-6 sm:pr-6 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 gap-4 sm:gap-2"
              >
                {/* Top: ID & Date */}
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-start pb-3 border-b border-gray-600 gap-3">
                  <div>
                    <span className="text-xs text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md inline-block">
                      #{order._id?.slice(-6) || "N/A"}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-medium">
                      {date.toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl">
                  {/* LEFT: Address & Distance */}
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 flex flex-wrap items-center gap-2 mb-2.5 capitalize">
                      <MdHomeWork
                        className="text-gray-400 shrink-0"
                        size={18}
                      />
                      <span>{address?.receiverName || "Unknown Customer"}</span>
                      {address?.addressType === "Home" ? (
                        <span className="ml-1 text-[10px] px-2.5 py-0.5 bg-gray-100 text-green-600 rounded-full font-bold uppercase tracking-wider shrink-0">
                          {address.addressType}
                        </span>
                      ) : (
                        <span className="ml-1 text-[10px] px-2.5 py-0.5 bg-gray-100 text-red-600 rounded-full font-bold uppercase tracking-wider shrink-0">
                          {address?.addressType || "Other"}
                        </span>
                      )}
                    </h2>

                    <div className="text-xs sm:text-sm text-gray-500 space-y-2 ml-7 font-medium border-l-2 border-gray-200 pl-3">
                      <p className="flex items-start gap-2">
                        <MdLocationOn
                          className="mt-0.5 text-gray-400 shrink-0"
                          size={16}
                        />
                        <span className="break-words">
                          {address?.flatNo}, {address?.buildingName}
                          <br />
                          {address?.streetArea}, {address?.areaName}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <MdPhone className="text-gray-400 shrink-0" size={16} />
                        +91 {address?.mobileNumber}
                      </p>

                      {distanceKm !== null && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 mb-1 text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50/70 w-fit px-3 py-1.5 rounded-lg border border-indigo-100">
                          <span className="flex items-center gap-1">
                            <FiNavigation
                              size={13}
                              className="text-indigo-500"
                            />{" "}
                            {distanceKm.toFixed(1)} km away
                          </span>
                          <span className="hidden sm:block w-1 h-1 rounded-full bg-indigo-300"></span>
                          <span className="flex items-center gap-1">
                            <MdDirectionsBike
                              size={14}
                              className="text-indigo-500"
                            />{" "}
                            ~{estimatedMins} mins
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Delivery Partner */}
                  <div className="md:border-l md:border-gray-200 md:pl-4 pt-4 md:pt-0 border-t border-gray-200 md:border-t-0 flex flex-col">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2.5">
                      <MdDirectionsBike
                        className="text-indigo-500 shrink-0"
                        size={18}
                      />
                      Delivery Partner
                    </h2>

                    {shopOrder?.deliveryBoy ? (
                      <div className="text-xs sm:text-sm text-gray-500 space-y-2 ml-7 font-medium border-l-2 border-indigo-100 pl-3">
                        <p className="flex items-center gap-2">
                          <FiUser
                            className="text-gray-400 shrink-0"
                            size={16}
                          />
                          <span className="text-gray-800 font-bold">
                            {shopOrder.deliveryBoy?.name || "Assigned Partner"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MdPhone
                            className="text-gray-400 shrink-0"
                            size={16}
                          />
                          +91{" "}
                          {shopOrder.deliveryBoy?.mobileNumber ||
                            shopOrder.deliveryBoy?.phone ||
                            "N/A"}
                        </p>
                        {shopOrder.deliveryBoy?.vehicleNumber && (
                          <p className="flex items-center gap-2">
                            <FiTruck
                              className="text-gray-400 shrink-0"
                              size={16}
                            />
                            <span className="uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              {shopOrder.deliveryBoy.vehicleNumber}
                            </span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[80px] ml-7 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 p-3">
                        <FiClock size={16} className="opacity-50 mb-1" />
                        <span className="text-xs font-medium">
                          Not Assigned Yet
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="mt-1">
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 scrollbar-hide pb-2">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || item.name || idx}
                        className="border border-gray-200 shadow-sm rounded-xl overflow-hidden min-w-[130px] sm:min-w-[150px] max-w-[140px] sm:max-w-[160px] flex-shrink-0 bg-white"
                      >
                        <div className="p-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-24 sm:h-28 object-cover bg-gray-100 rounded-lg"
                          />
                        </div>
                        <hr className="shadow-xl text-gray-600" />
                        <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50">
                          <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 truncate tracking-tight">
                            {item.name || "Item"}
                          </h3>
                          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">
                            Qty: {item.quantity}{" "}
                            <span className="font-bold">
                              ₹{item.price || 199}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls & Total */}
                <div className="flex flex-col gap-4 pt-4 border-t border-gray-500">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 gap-3">
                    <div className="text-sm font-bold text-gray-600 flex flex-wrap sm:flex-nowrap items-center gap-2">
                      Payment Method:
                      <div className="flex flex-wrap items-center gap-2 capitalize px-2.5 py-1 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-800 mt-1 sm:mt-0">
                        <span className="text-indigo-400">
                          {order.paymentMethod?.toLowerCase() === "cod"
                            ? "Cash on Delivery"
                            : "Online"}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span
                          className={
                            order.paymentStatus?.toLowerCase() === "paid" ||
                            order.paymentStatus?.toLowerCase() === "success"
                              ? "text-green-600"
                              : "text-amber-500"
                          }
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="text-sm text-gray-500 font-semibold hidden sm:block">
                        Action:
                      </div>

                      <select
                        value={shopOrder.status}
                        disabled={isLocked}
                        onChange={(e) =>
                          handleUpdateStatus(
                            order._id,
                            shopOrder.shop._id,
                            e.target.value,
                          )
                        }
                        className={`w-full sm:w-auto px-4 py-2 border ${statusBorderColor} ${statusTextColor} rounded-lg text-sm bg-white focus:outline-none focus:ring-4 focus:ring-opacity-20 capitalize font-bold shadow-sm transition-all ${
                          isLocked
                            ? "cursor-not-allowed opacity-70"
                            : "cursor-pointer"
                        }`}
                      >
                        {availableOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap justify-between items-center px-1 gap-4 mt-2 sm:mt-0">
                    <p className="font-medium text-gray-500 w-full sm:w-auto text-center sm:text-left">
                      Total Amount:{" "}
                      <span className="text-gray-900 font-black text-xl ml-1 tracking-tight">
                        ₹{orderTotal.toLocaleString()}
                      </span>
                    </p>

                    <button className="w-full sm:w-auto text-sm font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <FiTruck size={16} />
                      Track Order
                    </button>
                  </div>
                </div>

                {/* Assigned Delivery boy */}
                {shopOrder.status === "out for delivery" && (
                  <div className="mt-3 p-3 border rounded-lg text-sm bg-orange-50 border-orange-100">
                    <p className="font-semibold text-orange-800 mb-1">
                      Available Delivery Boys:
                    </p>
                    {orderAvailableBoys.length > 0 ? (
                      orderAvailableBoys.map((b, idx) => {
                        const boyLat = b?.location?.coordinates?.[1];
                        const boyLng = b?.location?.coordinates?.[0];

                        const boyDistance = calculateDistance(
                          shopOrder?.shop?.location?.latitude,
                          shopOrder?.shop?.location?.longitude,
                          boyLat,
                          boyLng,
                        );

                        return (
                          <div
                            key={b._id || idx}
                            className="flex items-center justify-between py-2 border-b border-orange-200/60 last:border-0"
                          >
                            <div>
                              <p className="text-orange-800 font-bold capitalize">
                                • {b.fullName}
                              </p>
                              <p className="text-orange-600/80 font-medium ml-3 text-xs">
                                {b.mobile}
                              </p>
                            </div>

                            {boyDistance != null && !isNaN(boyDistance) && (
                              <div className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1 shadow-sm justify-center whitespace-nowrap">
                                <p className="text-indigo-500">
                                  Distance{" "}
                                  <span className="text-sm font-bold">:</span>
                                </p>
                                <FiNavigation
                                  size={12}
                                  className="text-orange-600"
                                />
                                {boyDistance.toFixed(1)} km
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-orange-600/70 italic mt-2">
                        No delivery partners available.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border-2 border-gray-100 border-dashed shadow-sm px-4 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <FiPackage size={40} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-800 mb-1">
              No orders found
            </p>
            <p className="text-sm font-medium text-gray-500">
              We couldn't find any orders matching your criteria.
            </p>
            {isFiltering && (
              <button
                onClick={handleClearFilters}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors hover:shadow-lg w-full sm:w-auto cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrderPage;
