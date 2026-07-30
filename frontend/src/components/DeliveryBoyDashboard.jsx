import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Nav from "./Nav";
import { serverUrl } from "../App";

const DeliveryBoyDashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const [locationName, setLocationName] = useState("Locating...");

  const lon = userData?.location?.coordinates?.[0];
  const lat = userData?.location?.coordinates?.[1];

  useEffect(() => {
    let isMounted = true; // Prevents state updates on unmounted components

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
              // Required by Nominatim policy to prevent getting blocked
              email: "your-dev-email@example.com",
            },
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (isMounted) {
          // Extract a concise "Zone" rather than the entire verbose address
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
      isMounted = false; // Cleanup function
    };
  }, [lat, lon]);

  const getAssignments = async () =>{
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignment`,{withCredentials:true})
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() =>{
    getAssignments()
  })

  return (
    <div className="w-screen min-h-screen bg-[#fff9f6] overflow-y-auto">
      <Nav />

      <div className="w-full max-w-[800px] mx-auto pt-15 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold text-[#ff4d2d]">
              Welcome, {userData?.fullName || "Delivery Partner"} 👋
            </h1>

            <p className="text-gray-500 mt-1">Ready to deliver orders today.</p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Current Zone
            </p>

            <p
              className="text-base font-semibold text-gray-800 truncate max-w-[280px]"
              title={locationName}
            >
              {locationName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;
