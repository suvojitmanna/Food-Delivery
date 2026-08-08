import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Nav from "./Nav";
import { serverUrl } from "../App";
import {
  FiClock,
  FiMapPin,
  FiNavigation,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import DeliveryBoyTrackOrder from "./deliveryBoyTrackOrder";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import toast from "react-hot-toast";

// Calculate Distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
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
  return parseFloat((R * c).toFixed(1));
};

const DeliveryBoyDashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const [locationName, setLocationName] = useState("Locating...");
  const [currentOrder, setCurrentOrder] = useState(null);

  const lon = userData?.location?.coordinates?.[0];
  const lat = userData?.location?.coordinates?.[1];

  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  // OTP States
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLocationName = async () => {
      if (lat == null || lon == null) {
        if (isMounted) setLocationName("Location unavailable");
        return;
      }

      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse`,
          {
            params: {
              format: "json",
              lat,
              lon,
              addressdetails: 1,
              email: "your-dev-email@example.com",
            },
            headers: { Accept: "application/json" },
          },
        );

        if (isMounted) {
          const address = data.address;
          if (address) {
            const zone =
              address.suburb ||
              address.neighbourhood ||
              address.city ||
              address.town;
            const state = address.state;
            setLocationName(zone ? `${zone}, ${state}` : data.display_name);
          } else {
            setLocationName(data.display_name);
          }
        }
      } catch (error) {
        console.error("Geocoding Error:", error);
        if (isMounted) setLocationName("Failed to get location");
      }
    };

    fetchLocationName();
    return () => {
      isMounted = false;
    };
  }, [lat, lon]);

  const getAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const result = await axios.get(`${serverUrl}/api/order/get-assignment`, {
        withCredentials: true,
      });
      const assignments = result.data.assignments || result.data || [];
      setAvailableAssignments(assignments);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  const getCurrentOrder = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true },
      );
      setCurrentOrder(data);
    } catch (error) {
      setCurrentOrder(null);
      console.error(
        "No current order or failed to fetch:",
        error.response?.status,
      );
    }
  }, []);

  const handleAcceptOrder = async (assignmentId) => {
    try {
      setAcceptingId(assignmentId);
      await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, {
        withCredentials: true,
      });
      await getCurrentOrder();
    } catch (error) {
      console.error(
        "Failed to accept order:",
        error.response?.data || error.message,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
  }, [getAssignments, getCurrentOrder]);

  const sendDeliveryOtp = async () => {
    setIsSendingOtp(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder.orderId,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true },
      );
      console.log("OTP Sent:", result.data);
      setShowOtpBox(true);
      toast.success("OTP sent to the customer");
    } catch (error) {
      console.log("Failed to send OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const sendVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-verify-otp`,
        {
          orderId: currentOrder.orderId,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true },
      );

      setShowOtpBox(false);
      setOtp("");
      await getCurrentOrder();

      toast.success("OTP verified successfully!");
    } catch (error) {
      console.log("Failed to verify OTP:", error);
      toast.error(
        error.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#F4F4F2] overflow-y-auto pb-12 font-sans">
      <Nav />

      {/* Main Container*/}
      <div className="w-full max-w-[600px] mx-auto pt-6 px-4 flex flex-col gap-4">
        {!currentOrder ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-between items-center border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div>
                  <h1 className="text-base font-black text-gray-900 leading-tight">
                    Online
                  </h1>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5 truncate max-w-[200px]">
                    {locationName}
                  </p>
                </div>
              </div>
              <div className="bg-red-50 text-[#E23744] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {availableAssignments.length} Requests
              </div>
            </div>

            {/* Incoming Orders Feed */}
            <div className="flex flex-col gap-4 w-full mt-2">
              {loadingAssignments ? (
                [1, 2, 3].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-200 animate-pulse"
                  >
                    {/* Skeleton Top Bar */}
                    <div className="bg-gray-800 p-4 flex justify-between items-center">
                      <div>
                        <div className="h-2 w-16 bg-gray-600 rounded mb-2"></div>
                        <div className="h-6 w-24 bg-gray-500 rounded"></div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="h-2 w-20 bg-gray-600 rounded mb-2"></div>
                        <div className="h-8 w-20 bg-gray-700 rounded-lg"></div>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-10 w-10 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="w-full">
                          <div className="h-2 w-10 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 w-1/2 bg-gray-300 rounded mb-3"></div>
                          <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                          <div className="h-3 w-3/4 bg-gray-100 rounded mb-2"></div>
                          <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <div className="h-px w-full bg-gray-100"></div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-10 w-10 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="w-full">
                          <div className="h-2 w-10 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 w-1/2 bg-gray-300 rounded mb-3"></div>
                          <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                          <div className="h-3 w-3/4 bg-gray-100 rounded mb-2"></div>
                          <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 border-t border-b border-gray-100">
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>

                    <div className="p-4 bg-white">
                      <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : availableAssignments.length > 0 ? (
                availableAssignments.map((assignment, index) => {
                  const distToShop = calculateDistance(
                    lat,
                    lon,
                    assignment.shopLocation?.latitude,
                    assignment.shopLocation?.longitude,
                  );
                  const distToCustomer = calculateDistance(
                    assignment.shopLocation?.latitude,
                    assignment.shopLocation?.longitude,
                    assignment.deliveryAddress?.latitude,
                    assignment.deliveryAddress?.longitude,
                  );
                  const totalDistance = (distToShop + distToCustomer).toFixed(
                    1,
                  );

                  // Ensure items exist before attempting to map
                  const itemsList = assignment.items || [];
                  const isAccepting = acceptingId === assignment.assignmentId;

                  return (
                    <div
                      key={assignment.assignmentId || index}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-200"
                    >
                      <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                            Est. Earning
                          </p>
                          <h2 className="text-2xl font-black">
                            ₹{assignment.subtotal}
                          </h2>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                            Total Distance
                          </p>
                          <div className="flex items-center gap-1 text-lg font-black bg-gray-800 px-2 py-1 rounded-lg">
                            <FiNavigation
                              className="text-[#E23744]"
                              size={16}
                            />
                            {totalDistance} km
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col gap-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 bg-red-50 p-2.5 rounded-full text-[#E23744] shrink-0">
                            <FiMapPin size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                              Pickup
                            </p>
                            <h3 className="font-bold text-gray-900 text-base capitalize leading-tight">
                              {assignment.shopName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 leading-snug line-clamp-2">
                              {assignment.shopAddress ||
                                "Shop address details not available"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                              <FiNavigation
                                size={12}
                                className="text-gray-300"
                              />{" "}
                              {distToShop} km away from you
                            </p>
                          </div>
                        </div>

                        <div className="h-px w-full bg-gray-100"></div>

                        <div className="flex items-start gap-3">
                          <div className="mt-1 bg-green-50 p-2.5 rounded-full text-green-600 shrink-0">
                            <FiNavigation size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                              Drop
                            </p>
                            <h3 className="font-bold text-gray-900 text-base capitalize leading-tight">
                              {assignment.deliveryAddress?.receiverName ||
                                "Customer"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 leading-snug line-clamp-3">
                              {assignment.deliveryAddress?.streetArea}
                              {assignment.deliveryAddress?.landmark && (
                                <span className="block text-gray-500 mt-0.5">
                                  Landmark:{" "}
                                  {assignment.deliveryAddress.landmark}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                              <FiNavigation
                                size={12}
                                className="text-gray-300"
                              />{" "}
                              {distToCustomer} km trip from restaurant
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 px-4 py-2.5 border-t border-b border-gray-100 text-xs text-gray-600 font-medium">
                        Contains{" "}
                        <span className="font-black text-gray-900">
                          {itemsList.length} items
                        </span>{" "}
                        ({itemsList.map((i) => i.name).join(", ")})
                      </div>

                      <div className="p-4 bg-white">
                        <button
                          onClick={() =>
                            handleAcceptOrder(assignment.assignmentId)
                          }
                          disabled={isAccepting}
                          className={`w-full font-black py-4 rounded-xl shadow-md flex justify-center items-center gap-2 text-lg transition-transform uppercase tracking-wide ${
                            isAccepting
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700 text-white active:scale-95 cursor-pointer"
                          }`}
                        >
                          {isAccepting ? (
                            <>
                              Accepting{" "}
                              <FiLoader className="animate-spin" size={22} />
                            </>
                          ) : (
                            <>
                              Accept Order <FiCheck size={22} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-70">
                  <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100">
                    <FiClock className="text-4xl text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mt-2">
                    No incoming requests
                  </p>
                  <p className="text-gray-500 text-sm text-center">
                    Stay in your zone. New delivery orders will ping here.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DeliveryBoyTrackOrder
              currentOrder={currentOrder}
              refreshCurrentOrder={getCurrentOrder}
            />
            {!showOtpBox ? (
              <button
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 focus:outline-none ${isSendingOtp ? "opacity-75 cursor-not-allowed" : "active:scale-95"}`}
                onClick={sendDeliveryOtp}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? (
                  <>
                    <FiLoader className="animate-spin" size={20} />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <MdOutlineMarkEmailUnread size={20} />
                    Mark as delivered
                  </>
                )}
              </button>
            ) : (
              <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm mt-2">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Enter OTP sent to{" "}
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-1">
                    {currentOrder?.deliveryAddress?.receiverName || "Customer"}
                  </span>
                </p>

                <input
                  type="text"
                  autoFocus
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl mb-4 text-center tracking-[0.5em] font-bold text-lg text-gray-800 placeholder:tracking-normal placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="Enter OTP"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  maxLength={6}
                />

                <div className="flex gap-2">
                  <button
                    className="w-1/3 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all focus:outline-none active:scale-95"
                    onClick={() => setShowOtpBox(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`w-2/3 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all focus:outline-none ${isVerifyingOtp ? "opacity-75 cursor-not-allowed" : "active:scale-95"}`}
                    onClick={sendVerifyOtp}
                    disabled={isVerifyingOtp || !otp}
                  >
                    {isVerifyingOtp ? (
                      <>
                        <FiLoader className="animate-spin" size={18} />
                        Verifying...
                      </>
                    ) : (
                      "Submit OTP"
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;
