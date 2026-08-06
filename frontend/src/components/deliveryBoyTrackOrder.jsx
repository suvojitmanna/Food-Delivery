import { useMemo, useEffect, useState } from "react";
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
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

const DeliveryBoyTrackOrder = ({ currentOrder }) => {
  const [progressWidth, setProgressWidth] = useState(0);

  const [routeInfo, setRouteInfo] = useState({
    distance: 0,
    duration: 0,
  });

  if (!currentOrder) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center font-medium text-slate-500 bg-slate-50">
        Loading order details...
      </div>
    );
  }

  const deliveryBoyLat = Number(currentOrder.deliveryBoyLocation?.lat);
  const deliveryBoyLon = Number(currentOrder.deliveryBoyLocation?.lon);
  const customerLat = Number(currentOrder.customerLocation?.lat);
  const customerLon = Number(currentOrder.customerLocation?.lon);
console.log(customerLat)
console.log(customerLon)
  if (
    isNaN(deliveryBoyLat) ||
    isNaN(deliveryBoyLon) ||
    isNaN(customerLat) ||
    isNaN(customerLon)
  ) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center text-red-500 font-medium bg-slate-50">
        Location data is currently unavailable
      </div>
    );
  }

  const { shop, shopOrder, deliveryAddress, deliveryBoy, orderId } = currentOrder;
  const boyPosition = [deliveryBoyLat, deliveryBoyLon];
  const customerPosition = [customerLat, customerLon];
  
  const estimatedTime = useMemo(() => {
    const minsPerKm = 3;
    const distanceKm = calculateDistance(
      deliveryBoyLat,
      deliveryBoyLon,
      customerLat,
      customerLon,
    );
    if (distanceKm !== null && !isNaN(distanceKm)) {
      const mins = Math.ceil(distanceKm * minsPerKm);
      return mins <= 0 ? 1 : mins;
    }
    return "--";
  }, [deliveryBoyLat, deliveryBoyLon, customerLat, customerLon]);

  const timeline = useMemo(() => {
    const currentStatus = (shopOrder?.status || "pending").toLowerCase();
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
  }, [shopOrder?.status]);

  useEffect(() => {
    const updateProgress = () => {
      if (!shopOrder) return;

      if (shopOrder.status?.toLowerCase() === "delivered") {
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

      if (calculatedProgress < minProgress) calculatedProgress = minProgress + 2;
      if (calculatedProgress > maxProgress) calculatedProgress = maxProgress - 2;

      setProgressWidth(calculatedProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 10000);
    return () => clearInterval(interval);
  }, [shopOrder, timeline, estimatedTime]);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 font-sans pb-8 overflow-x-hidden flex flex-col">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:py-4 flex items-center gap-3 shadow-sm">
        <button
          aria-label="Go back"
          className="p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-slate-800 tracking-tight truncate">
          Track Order
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-4 pb-6 flex flex-col gap-4 sm:gap-5 flex-1">
        
        {/* Custom Progress Bar */}
        <div className="w-full bg-gradient-to-br from-green-600 to-emerald-700 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-indigo-100 text-[13px] sm:text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FiCheckCircle size={14} className="text-indigo-300" />
                  {shopOrder?.status || "Processing"}
                </p>
                <div className="flex items-center gap-6 sm:gap-8 mt-4">
                  <div>
                    <p className="text-[11px] sm:text-xs text-indigo-200 uppercase tracking-wide">
                      Distance
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {routeInfo.distance.toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs text-indigo-200 uppercase tracking-wide">
                      ETA
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {Math.ceil(routeInfo.duration)} min
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                <FaMotorcycle size={24} className="text-white sm:text-[28px]" />
              </div>
            </div>

            {/* Integrated Sleek Progress Bar */}
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

        {/* Live Map (Responsive Height) */}
        <div className="w-full h-[35vh] min-h-[250px] sm:h-[400px] bg-slate-200 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200 shrink-0 z-0">
          {(boyPosition[0] !== 0 || customerPosition[0] !== 0) && (
            <MapContainer
              center={boyPosition}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <MapUpdater center={boyPosition} />
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Routing
                start={[
                  currentOrder.deliveryBoyLocation.lat,
                  currentOrder.deliveryBoyLocation.lon,
                ]}
                end={[
                  currentOrder.customerLocation.lat,
                  currentOrder.customerLocation.lon,
                ]}
                onRouteFound={setRouteInfo}
              />

              <Marker position={boyPosition} icon={deliveryIcon}>
                <Popup>Delivery Boy</Popup>
              </Marker>

              <Marker position={customerPosition} icon={customerIcon}>
                <Popup>{deliveryAddress?.receiverName || "Customer"}</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full space-y-4 relative z-10 flex-1">
          {/* Delivery Partner Card */}
          {(shopOrder?.status === "out for delivery" ||
            shopOrder?.status === "picked") &&
            deliveryBoy && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                    {deliveryBoy.profilePic ? (
                      <img
                        src={deliveryBoy.profilePic}
                        alt={`${deliveryBoy?.name || "Delivery Partner"} profile`}
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
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <p className="font-mono font-semibold text-slate-500 text-[10px] sm:text-[11px] bg-slate-100 px-2 py-0.5 rounded uppercase truncate">
                        Name:{" "}
                        <span className="text-orange-600 capitalize">
                          {deliveryBoy.fullName || "ON WAY"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${deliveryBoy?.mobile}`}
                  aria-label="Call delivery partner"
                  className="w-10 h-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                >
                  <FiPhone size={18} />
                </a>
              </div>
            )}

          {/* Dynamic Timeline */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <FiClock /> Timeline
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
                        ? "bg-indigo-600 ring-indigo-50 shadow-[0_0_0_4px_rgba(79,70,229,0.1)]"
                        : step.completed
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  >
                    {step.active && (
                      <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>

                  <div className="flex-1 flex justify-between items-center min-w-0">
                    <span
                      className={`font-semibold text-sm sm:text-base truncate pr-2 ${
                        step.active
                          ? "text-indigo-600"
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
                      <span className="text-[10px] sm:text-[11px] font-bold text-indigo-400 shrink-0">
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

          {/* Formatted Delivery Address */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
              <FiMapPin size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Delivery Address
                </h4>
                <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">
                  {deliveryAddress?.addressType}
                </span>
              </div>

              <p className="font-bold text-slate-800 text-sm sm:text-base capitalize mb-0.5 truncate">
                {deliveryAddress?.receiverName}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-snug break-words">
                {deliveryAddress?.flatNo}, {deliveryAddress?.buildingName}
                <br />
                {deliveryAddress?.streetArea}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2 flex items-center gap-1.5">
                <FiPhone size={12} /> +91 {deliveryAddress?.mobileNumber}
              </p>
            </div>
          </div>

          {/* Order Details */}
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
                  <FiShoppingBag size={18} className="text-slate-400 sm:text-[20px]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg capitalize truncate">
                  {shop?.name}
                </h3>
                <p className="text-[10px] sm:text-xs font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
                  Order #{orderId?.slice(-8)}
                </p>
              </div>
              <a
                href={`tel:${currentOrder?.shopMobile}`}
                aria-label="Call shop"
                className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <FiPhone size={16} className="sm:text-[18px]" />
              </a>
            </div>

            {/* Items List Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiBox /> Your Items
              </h4>

              {shopOrder?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-dashed border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Item Image */}
                    {item.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-slate-700 capitalize truncate">
                        {item.name || "Item"}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <span className="font-bold text-slate-900 bg-slate-50 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs sm:text-sm border border-slate-100 shrink-0">
                    ×{item.quantity}
                  </span>
                </div>
              ))}

              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-sm sm:text-base text-slate-500">Item Total</span>
                <span className="font-black text-slate-900 text-base sm:text-lg">
                  ₹{shopOrder?.subtotal}
                </span>
              </div>
            </div>
          </div>

          {/* Help / Support Footer */}
          <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl p-4 shadow-lg mt-2">
            <div className="flex items-center gap-3">
              <FiHelpCircle size={22} className="text-slate-400 sm:text-[24px]" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">Need Help?</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  We're here to assist you
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

export default DeliveryBoyTrackOrder;