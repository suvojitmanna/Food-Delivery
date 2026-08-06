import React, { useMemo, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiClock,
  FiBox,
  FiCheckCircle,
  FiHelpCircle,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { serverUrl } from "../App";
import { AnimatePresence, motion } from "framer-motion";

import Boy from "../assets/scooter.png";
import Home from "../assets/Home.png";
import Routing from "./routing";

const deliveryIcon = new L.Icon({
  iconUrl: Boy,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

const customerIcon = new L.Icon({
  iconUrl: Home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const shopIcon = new L.divIcon({
  className: "custom-shop-marker",
  html: `<div style="background-color: #f97316; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
           <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" color="white" style="color:white; width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.flyTo(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  if (lat1 === lat2 && lon1 === lon2) return 0;

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

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);
  const [routeInfo, setRouteInfo] = useState({
    distance: 0,
    duration: 0,
  });

  const [showBill, setShowBill] = useState(false);
  const billRef = useRef(null);

  const handleGetTrackOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order tracking details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      handleGetTrackOrder();
    }
  }, [orderId]);

  const shopOrder = order?.shopOrders?.[0];
  const deliveryBoy = shopOrder?.assignDeliveryBoy;
  const shop = shopOrder?.shop;
  const deliveryAddress = order?.deliveryAddress;
  const isAddressObject =
    typeof deliveryAddress === "object" && deliveryAddress !== null;

  const currentStatus = (shopOrder?.status || "pending").toLowerCase();

  const isOutForDeliveryOrLater = ["out for delivery", "delivered"].includes(
    currentStatus,
  );
  const isAssigningPartner = isOutForDeliveryOrLater && !deliveryBoy;
  const showDeliveryBoyDetails = isOutForDeliveryOrLater && !!deliveryBoy;

  const itemTotal = shopOrder?.subtotal || 0;
  const gstTotal = shopOrder?.tax || shopOrder?.gst || 0;
  const packingFeeTotal = shopOrder?.packingFee || 0;
  const platformFee = shopOrder?.platformFee || 0;
  const tipAmount = shopOrder?.tip || 0;
  const couponDiscount = shopOrder?.discount || 0;
  const grandTotal = order?.totalAmount || shopOrder?.total || 0;

  const shopLat = Number(
    shop?.location?.coordinates?.[1] ||
      shop?.location?.latitude ||
      shop?.location?.lat ||
      0,
  );
  const shopLon = Number(
    shop?.location?.coordinates?.[0] ||
      shop?.location?.longitude ||
      shop?.location?.lng ||
      0,
  );

  const boyLat = Number(
    deliveryBoy?.location?.coordinates?.[1] ||
      deliveryBoy?.location?.latitude ||
      deliveryBoy?.location?.lat ||
      0,
  );
  const boyLon = Number(
    deliveryBoy?.location?.coordinates?.[0] ||
      deliveryBoy?.location?.longitude ||
      deliveryBoy?.location?.lng ||
      0,
  );

  const customerLat = Number(
    order?.user?.location?.coordinates?.[1] ||
      (isAddressObject
        ? deliveryAddress?.location?.lat || deliveryAddress?.latitude
        : 0) ||
      0,
  );
  const customerLon = Number(
    order?.user?.location?.coordinates?.[0] ||
      (isAddressObject
        ? deliveryAddress?.location?.lng || deliveryAddress?.longitude
        : 0) ||
      0,
  );

  const startLat = showDeliveryBoyDetails ? boyLat : shopLat;
  const startLon = showDeliveryBoyDetails ? boyLon : shopLon;

  const startPosition = [startLat, startLon];
  const customerPosition = [customerLat, customerLon];

  const estimatedTime = useMemo(() => {
    const minsPerKm = 3;
    const distanceKm = calculateDistance(
      startLat,
      startLon,
      customerLat,
      customerLon,
    );
    if (distanceKm !== null && !isNaN(distanceKm)) {
      const mins = Math.ceil(distanceKm * minsPerKm);
      return mins <= 0 ? 1 : mins;
    }
    return "--";
  }, [startLat, startLon, customerLat, customerLon]);

  // Order Status Timeline Steps
  const timeline = useMemo(() => {
    const steps = [
      { id: "pending", label: "Order Placed" },
      { id: "accepted", label: "Accepted" },
      { id: "preparing", label: "Preparing" },
      { id: "picked", label: "Picked Up" },
      { id: "out for delivery", label: "Out for Delivery" },
      { id: "delivered", label: "Delivered" },
    ];

    let currentIndex = steps.findIndex(
      (s) =>
        s.id === currentStatus ||
        (s.id === "picked" && currentStatus === "pickup"),
    );
    if (currentIndex === -1) currentIndex = 0;

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      active: index === currentIndex,
    }));
  }, [currentStatus]);

  // Animated Progress Bar
  useEffect(() => {
    const updateProgress = () => {
      if (!shopOrder) return;

      if (currentStatus === "delivered") {
        setProgressWidth(100);
        return;
      }

      const activeIndex = timeline.findIndex((t) => t.active);
      const minProgress = (activeIndex / timeline.length) * 100;
      const maxProgress = ((activeIndex + 1) / timeline.length) * 100;

      if (!shopOrder.createdAt || estimatedTime === "--") {
        setProgressWidth(maxProgress);
        return;
      }

      const createdTime = new Date(shopOrder.createdAt).getTime();
      const now = Date.now();
      const elapsedMs = Math.max(0, now - createdTime);
      const remainingMs = estimatedTime * 60 * 1000;
      const totalMs = elapsedMs + remainingMs;

      let calculatedProgress = (elapsedMs / totalMs) * 100;

      if (calculatedProgress < minProgress)
        calculatedProgress = minProgress + 2;
      if (calculatedProgress > maxProgress)
        calculatedProgress = maxProgress - 2;

      setProgressWidth(calculatedProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 10000);
    return () => clearInterval(interval);
  }, [shopOrder, timeline, estimatedTime, currentStatus]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center font-medium text-slate-500 bg-slate-50">
        Loading live tracking details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center text-red-500 font-medium bg-slate-50">
        Order tracking information unavailable.
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 font-sans pb-8 overflow-x-hidden flex flex-col">
      {/* Top Navigation Bar with Header Status */}
      <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => navigate("/")}
            aria-label="Go back"
            className="p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-800 tracking-tight truncate">
              Track Order
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
              ID: {orderId?.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 pl-2">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Status
          </span>
          <span className="text-xs sm:text-sm font-black text-orange-600 uppercase">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-4 pb-6 flex flex-col gap-4 sm:gap-5 flex-1">

        <div className="w-full bg-gradient-to-br from-orange-500 to-rose-600 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 text-white shadow-xl shadow-orange-200/50 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-orange-100 text-[13px] sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FiCheckCircle size={15} className="text-orange-200" />
                    {shopOrder?.status || "Processing"}
                  </p>
                  {shopOrder?.updatedAt && (
                    <span className="text-orange-200 text-[10px] sm:text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                      {new Date(shopOrder.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 sm:gap-8 mt-4">
                  <div>
                    <p className="text-[11px] sm:text-xs text-orange-200 uppercase tracking-wide">
                      Distance
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {routeInfo.distance > 0
                        ? `${routeInfo.distance.toFixed(1)} km`
                        : `${
                            calculateDistance(
                              startLat,
                              startLon,
                              customerLat,
                              customerLon,
                            )?.toFixed(1) || 0
                          } km`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs text-orange-200 uppercase tracking-wide">
                      ETA
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {routeInfo.duration > 0
                        ? `${Math.ceil(routeInfo.duration)} min`
                        : `${estimatedTime} min`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                <FaMotorcycle size={24} className="text-white sm:text-[28px]" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 sm:h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-white rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                style={{ width: `${progressWidth}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[35vh] min-h-[250px] sm:h-[400px] bg-slate-200 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200 shrink-0 z-0">
          <MapContainer
            center={startLat !== 0 ? startPosition : [22.5726, 88.3639]}
            zoom={14}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <MapUpdater
              center={startLat !== 0 ? startPosition : [22.5726, 88.3639]}
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {Routing && startLat !== 0 && customerLat !== 0 && (
              <Routing
                start={startPosition}
                end={customerPosition}
                onRouteFound={setRouteInfo}
              />
            )}

            {startLat !== 0 && (
              <Marker
                position={startPosition}
                icon={showDeliveryBoyDetails ? deliveryIcon : shopIcon}
              >
                <Popup>
                  {showDeliveryBoyDetails
                    ? "Delivery Partner"
                    : "Shop Location"}
                </Popup>
              </Marker>
            )}

            {/* Customer Marker */}
            {customerLat !== 0 && (
              <Marker position={customerPosition} icon={customerIcon}>
                <Popup>
                  {isAddressObject
                    ? deliveryAddress.receiverName
                    : order?.user?.fullName || "Delivery Location"}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Details Section */}
        <div className="w-full space-y-4 relative z-10 flex-1">
          {isAssigningPartner ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-50/40"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-14 h-14 mb-3">
                  <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-60"></div>
                  <div
                    className="absolute inset-2 bg-orange-300 rounded-full animate-ping opacity-60"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div className="absolute inset-0 m-auto w-10 h-10 flex items-center justify-center bg-orange-500 rounded-full z-10 shadow-lg shadow-orange-500/30">
                    <FaMotorcycle size={18} className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  Assigning Delivery Partner...
                </h3>
                <p className="text-slate-500 text-xs mt-1 px-4 leading-relaxed">
                  Hang tight! We are looking for the best delivery partner
                  nearby to pick up your order.
                </p>
              </div>
            </div>
          ) : showDeliveryBoyDetails ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                  {deliveryBoy.profilePic ? (
                    <img
                      src={deliveryBoy.profilePic}
                      alt={deliveryBoy.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser size={20} className="sm:w-6 sm:h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight capitalize truncate">
                    Assigned Partner
                  </h3>
                  <p className="font-mono font-semibold text-slate-500 text-[10px] sm:text-[11px] bg-slate-100 px-2 py-0.5 rounded uppercase mt-1 inline-block truncate">
                    Name:{" "}
                    <span className="text-orange-600 capitalize">
                      {deliveryBoy.fullName || "Delivery Partner"}
                    </span>
                  </p>
                </div>
              </div>

              {deliveryBoy.mobile && (
                <a
                  href={`tel:${deliveryBoy.mobile}`}
                  aria-label="Call delivery partner"
                  className="w-10 h-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                >
                  <FiPhone size={18} />
                </a>
              )}
            </div>
          ) : null}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FiClock /> Order Status Timeline
              </span>
            </h4>

            <div className="relative pl-3 space-y-6">
              <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-slate-100"></div>

              {timeline.map((step, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-3 sm:gap-4 group"
                >
                  <div
                    className={`w-3 h-3 rounded-full relative z-10 ring-4 ring-white ${
                      step.active
                        ? "bg-orange-600 ring-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                        : step.completed
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                    }`}
                  >
                    {step.active && (
                      <div className="absolute inset-0 bg-orange-600 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>

                  <div className="flex-1 flex justify-between items-center min-w-0">
                    <span
                      className={`font-semibold text-sm sm:text-base truncate pr-2 ${
                        step.active
                          ? "text-orange-600"
                          : step.completed
                            ? "text-slate-700"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index === 0 && shopOrder?.createdAt && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0">
                        {new Date(shopOrder.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {step.active && index !== 0 && shopOrder?.updatedAt && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-orange-600 shrink-0 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                        {new Date(shopOrder.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery / Customer Details Fallback */}
          {isAddressObject ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                <FiMapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Delivery Address
                  </h4>
                  {deliveryAddress.addressType && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">
                      {deliveryAddress.addressType}
                    </span>
                  )}
                </div>

                <p className="font-bold text-slate-800 text-sm sm:text-base capitalize mb-0.5 truncate">
                  {deliveryAddress.receiverName}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 leading-snug break-words">
                  {deliveryAddress.flatNo && `${deliveryAddress.flatNo}, `}
                  {deliveryAddress.buildingName &&
                    `${deliveryAddress.buildingName}, `}
                  {deliveryAddress.streetArea || deliveryAddress.address}
                </p>
                {deliveryAddress.mobileNumber && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2 flex items-center gap-1.5">
                    <FiPhone size={12} /> +91 {deliveryAddress.mobileNumber}
                  </p>
                )}
              </div>
            </div>
          ) : order?.user ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                <FiUser size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Customer Details
                </h4>
                <p className="font-bold text-slate-800 text-sm sm:text-base capitalize mb-0.5 truncate">
                  {order.user.fullName}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 leading-snug break-words">
                  {order.user.email}
                </p>
              </div>
            </div>
          ) : null}

          {/* Shop & Items Summary */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 w-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                {shop?.image ? (
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiShoppingBag
                    size={18}
                    className="text-slate-400 sm:text-[20px]"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg capitalize truncate">
                  {shop?.name || "Store"}
                </h3>
                <p className="text-[10px] sm:text-xs font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
                  Order #{orderId?.slice(-8)}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 mb-4">
              <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiBox /> Ordered Items
              </h4>

              {shopOrder?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-dashed border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-slate-700 capitalize truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900 bg-slate-50 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs sm:text-sm border border-slate-100 shrink-0">
                    ×{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details Accordion */}
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
                  {!showBill && (
                    <span className="font-bold text-lg text-[#ff4d2d]">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  )}
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
                        <span>
                          ₹{Math.round(gstTotal).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {packingFeeTotal > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Packing</span>
                          <span>
                            ₹{packingFeeTotal.toLocaleString("en-IN")}
                          </span>
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
                        <span className="font-black text-xl text-red-600">
                          ₹{grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Customer Support Footer */}
          <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl p-4 shadow-lg mt-2">
            <div className="flex items-center gap-3">
              <FiHelpCircle
                size={22}
                className="text-slate-400 sm:text-[24px]"
              />
              <div>
                <h4 className="font-bold text-sm sm:text-base">Need Help?</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  Contact customer support anytime
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-bold text-xs sm:text-sm cursor-pointer shrink-0">
              Support
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
};

export default TrackOrderPage;
