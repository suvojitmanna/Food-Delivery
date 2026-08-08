import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLocationDot, FaXmark } from "react-icons/fa6";
import { FiCrosshair, FiMapPin, FiNavigation } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

const DEFAULT_LOCATION = {
  latitude: 22.5726,
  longitude: 88.3639,
};

const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapUpdater = ({ lat, lon }) => {
  const map = useMap();

  useEffect(() => {
    if (
      typeof lat === "number" &&
      typeof lon === "number" &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lon)
    ) {
      map.flyTo([lat, lon], 16, {
        duration: 0.8,
      });
    }
  }, [lat, lon, map]);

  return null;
};

const ChangeLocation = () => {
  const navigate = useNavigate();

  const markerRef = useRef(null);

  const [lat, setLat] = useState(DEFAULT_LOCATION.latitude);
  const [lon, setLon] = useState(DEFAULT_LOCATION.longitude);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const [formData, setFormData] = useState({
    buildingName: "",
    areaName: "",
    streetArea: "",
    city: "",
    state: "",
    country: "",
    address: "",
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  });

  const GEOAPIFY_KEY = import.meta.env.VITE_GEO_API_KEY;
  // REVERSE GEOCODING
  const reverseGeocode = async (latitude, longitude) => {
    try {
      setAddressLoading(true);
      if (!GEOAPIFY_KEY) {
        console.error("❌ VITE_GEOAPIFY_API_KEY is missing");
        return;
      }

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`,
      );

      const data = await response.json();
      console.log("🌍 Reverse Geocode:", data);
      if (!response.ok) {
        console.error("Geoapify error:", data);
        return;
      }

      const place = data?.features?.[0];
      if (!place) {
        console.error("❌ No location found");
        return;
      }

      const properties = place.properties || {};
      console.log("📍 Location properties:", properties);
      const city =
        properties.city ||
        properties.town ||
        properties.village ||
        properties.municipality ||
        properties.county ||
        "";

      const state = properties.state || "";
      const country = properties.country || "";
      const formatted = properties.formatted || "";

      setFormData((prev) => ({
        ...prev,

        buildingName:
          properties.name ||
          properties.address_line1 ||
          city ||
          "Selected location",
        areaName:
          properties.address_line2 ||
          properties.suburb ||
          properties.district ||
          "",

        streetArea:
          properties.street || properties.suburb || properties.district || "",

        city,
        state,
        country,
        address: formatted,
        latitude,
        longitude,
      }));

      setSearchQuery(formatted);
    } catch (error) {
      console.error("❌ Reverse geocoding error:", error);
    } finally {
      setAddressLoading(false);
    }
  };
  // SEARCH LOCATION
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            searchQuery,
          )}&limit=6&filter=countrycode:in&apiKey=${GEOAPIFY_KEY}`,
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }
        const data = await response.json();
        setSuggestions(data?.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Location search error:", error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, GEOAPIFY_KEY]);

  // SELECT SEARCH RESULT
  const applyPlace = async (place) => {
    try {
      const coordinates = place?.geometry?.coordinates;
      if (!coordinates || coordinates.length < 2) {
        return;
      }

      const [longitude, latitude] = coordinates;
      setLat(latitude);
      setLon(longitude);
      const properties = place.properties || {};

      const city =
        properties.city ||
        properties.town ||
        properties.village ||
        properties.municipality ||
        properties.county ||
        "";

      const state = properties.state || "";
      const country = properties.country || "";
      const formatted = properties.formatted || "";
      setFormData({
        buildingName:
          properties.name ||
          properties.address_line1 ||
          city ||
          "Selected location",
        areaName:
          properties.address_line2 ||
          properties.suburb ||
          properties.district ||
          "",
        streetArea:
          properties.street || properties.suburb || properties.district || "",
        city,
        state,
        country,
        address: formatted,
        latitude,
        longitude,
      });

      setSearchQuery(formatted);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Apply place error:", error);
    }
  };
  // CURRENT LOCATION
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;

        setLat(latitude);
        setLon(longitude);

        await reverseGeocode(latitude, longitude);

        setShowSuggestions(false);
        setIsDetecting(false);
      },

      (error) => {
        console.error("Location detection error:", error);

        setIsDetecting(false);

        alert(
          "Unable to detect your location. Please allow location permission.",
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };
  // MARKER DRAG
  const handleMarkerDragEnd = async () => {
    const marker = markerRef.current;

    if (!marker) return;

    const position = marker.getLatLng();

    const newLat = position.lat;
    const newLon = position.lng;

    setLat(newLat);
    setLon(newLon);

    await reverseGeocode(newLat, newLon);
  };

  // MARKER EVENTS
  const eventHandlers = {
    dragend: handleMarkerDragEnd,
  };

  // CONFIRM LOCATION
  const handleConfirmLocation = () => {
    if (formData.latitude == null || formData.longitude == null) {
      return;
    }

    const locationData = {
      city: formData.city || "",
      state: formData.state || "",
      country: formData.country || "",
      address: formData.address || "",
      buildingName: formData.buildingName || "",
      areaName: formData.areaName || "",
      streetArea: formData.streetArea || "",
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    };

    console.log("📍 SAVING LOCATION:", locationData);

    // 1. Save permanently
    localStorage.setItem("selectedLocation", JSON.stringify(locationData));

    // 2. Update Navbar immediately
    window.dispatchEvent(
      new CustomEvent("locationChanged", {
        detail: locationData,
      }),
    );

    // 3. Go back
    navigate(-1);
  };
  // LOAD SAVED LOCATION
  useEffect(() => {
    const saved = localStorage.getItem("selectedLocation");

    if (!saved) {
      reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);

      return;
    }

    try {
      const location = JSON.parse(saved);

      if (location.latitude != null && location.longitude != null) {
        setLat(Number(location.latitude));

        setLon(Number(location.longitude));
      }

      setFormData((prev) => ({
        ...prev,
        ...location,
      }));

      if (location.address) {
        setSearchQuery(location.address);
      }
    } catch (error) {
      console.error("Saved location error:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="sticky top-0 z-[1200] bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1 className="font-bold text-gray-900">Change address</h1>

            <p className="text-xs text-gray-400">
              Choose where you want your food delivered
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-5">
        <div className="relative">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-3 px-4 h-14">
            <IoSearch size={21} className="text-gray-400 shrink-0" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search area, city, street..."
              className="flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <FaXmark className="text-gray-400" />
              </button>
            )}
          </div>

          {/* SEARCH SUGGESTIONS */}

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[1300]"
              >
                {/* CURRENT LOCATION */}

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                    <FiNavigation className="text-green-600" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Use my current location
                    </p>

                    <p className="text-xs text-gray-400">
                      Detect your current position
                    </p>
                  </div>
                </button>

                {/* LOADING */}

                {searchLoading && (
                  <div className="px-4 py-4 flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
                    Searching...
                  </div>
                )}

                {/* NO RESULT */}
                {!searchLoading && searchQuery && suggestions.length === 0 && (
                  <div className="px-4 py-4 text-sm text-gray-400">
                    No matches found
                  </div>
                )}

                {/* RESULTS */}
                {!searchLoading &&
                  suggestions.map((place) => (
                    <button
                      type="button"
                      key={
                        place.properties?.place_id ||
                        `${place.geometry.coordinates[0]}-${place.geometry.coordinates[1]}`
                      }
                      onClick={() => applyPlace(place)}
                      className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <FiMapPin className="text-gray-500" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {place.properties?.name ||
                            place.properties?.formatted}
                        </p>

                        <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                          {place.properties?.formatted}
                        </p>
                      </div>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-5">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
          <div className="h-[360px] md:h-[450px] w-full">
            <MapContainer
              center={[lat, lon]}
              zoom={16}
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapUpdater lat={lat} lon={lon} />

              {!Number.isNaN(lat) && !Number.isNaN(lon) && (
                <Marker
                  ref={markerRef}
                  position={[lat, lon]}
                  icon={customIcon}
                  draggable={true}
                  eventHandlers={eventHandlers}
                />
              )}
            </MapContainer>

            {/* LOCATE BUTTON */}
            <button
              type="button"
              onClick={handleDetectLocation}
              className="absolute bottom-4 right-4 z-[1000] w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition"
            >
              <FiCrosshair
                size={21}
                className={
                  isDetecting ? "animate-spin text-green-600" : "text-gray-700"
                }
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <FiMapPin className="text-green-600" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Delivery location
              </p>
              {addressLoading ? (
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-gray-200 animate-pulse" />

                  <div className="h-3 w-1/2 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ) : (
                <>
                  <h2 className="text-base font-bold text-gray-900 mt-1">
                    {formData.city || "Selected location"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.address ||
                      "Move the pin or search for a location"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* COORDINATES */}
          {!addressLoading && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Latitude
                </p>

                <p className="text-xs font-semibold text-gray-700 mt-1">
                  {Number(lat).toFixed(6)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] uppercase font-bold text-gray-400">
                  Longitude
                </p>

                <p className="text-xs font-semibold text-gray-700 mt-1">
                  {Number(lon).toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirmLocation}
          disabled={addressLoading || !formData.latitude || !formData.longitude}
          className="w-full h-14 mt-5 rounded-2xl bg-[#ff4d2d] hover:bg-[#ef4023] text-white font-bold shadow-lg shadow-orange-200 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Confirm location
        </button>
      </div>
    </div>
  );
};

export default ChangeLocation;
