import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaUtensils } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineImage } from "react-icons/md";
import {
  FiSearch,
  FiX,
  FiNavigation,
  FiMapPin,
  FiCrosshair,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { glassToast, serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { GrUpdate } from "react-icons/gr";

// Map Imports
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Map Pin
const customIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
      <div style="
        width:26px;
        height:26px;
        background:#ff4d2d;
        border-radius:999px;
        border:3px solid white;
        box-shadow:0 6px 16px rgba(0,0,0,.35);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="width:8px;height:8px;background:white;border-radius:999px;"></div>
      </div>
      <div style="
        width:10px;
        height:10px;
        background:#ff4d2d;
        margin-top:-6px;
        transform:rotate(45deg);
        border-radius:0 0 2px 0;
      "></div>
    </div>
  `,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
});

function MapUpdater({ lat, lon }) {
  const map = useMap();

  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lon)) {
      setTimeout(() => {
        map.invalidateSize();
        map.setView([lat, lon], 16);
      }, 100);
    }
  }, [lat, lon, map]);

  return null;
}

const CreateEditShop = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const { city } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form States
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAdress] = useState(myShopData?.address || "");
  const [citys, setCitys] = useState(myShopData?.city || "");
  const [state, setState] = useState(myShopData?.state || "");
  const [description, setDescription] = useState(myShopData?.description || "");
  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  // At the top of CreateEditShop:

  // Map & Location States
  const [position, setPosition] = useState([
    Number(myShopData?.location?.latitude) || 22.5726,
    Number(myShopData?.location?.longitude) || 88.3639,
  ]);
  const lat = position[0];
  const lon = position[1];

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [areaName, setAreaName] = useState("");

  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);
  const markerRef = useRef(null);
  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEO_API_KEY;

  // Initial Location Effect
  useEffect(() => {
    if (!myShopData && city) {
      setCitys(city?.city || "");
      setState(city?.state || "");

      const fullAddress = [
        city.address_line1,
        city?.street || city?.road,
        city?.suburb,
        city?.city,
        city?.postcode,
        city?.state,
        city?.country,
      ]
        .filter(Boolean)
        .join(", ");
      setAdress(fullAddress);

      const initialLat = Number(city?.lat || city?.latitude || 22.5726);
      const initialLon = Number(city?.lon || city?.longitude || 88.3639);
      setPosition([initialLat, initialLon]);
    }
  }, [city, myShopData]);

  // Handle Location Detection
  const fetchAddressFromCoords = async (latitude, longitude) => {
    setAddressLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`,
      );
      const data = await response.json();
      if (data.features.length > 0) {
        const place = data.features[0].properties;
        setAdress(place.formatted || "");
        setCitys(place.city || place.suburb || "");
        setState(place.state || "");
        setBuildingName(place.name || "");
        setAreaName(place.suburb || place.city || place.state || "");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAddressLoading(false);
    }
  };

const handleDetectLocation = async () => {
  try {
    setIsDetecting(true);

    if (!navigator.geolocation) {
      glassToast("Geolocation is not supported.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (positionData) => {
        const lat = positionData.coords.latitude;
        const lon = positionData.coords.longitude;

        setPosition([lat, lon]);
        await fetchAddressFromCoords(lat, lon);
        setShowSuggestions(false);

        glassToast("Current location detected.", "success");
      },
      (error) => {
        console.error("Geolocation Error:", error);
        // ... error handling
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      },
    );
  } catch (err) {
    console.error(err);
    glassToast("Failed to detect location.", "error");
  } finally {
    setIsDetecting(false);
  }
};

  const eventHandlers = useRef({
    dragend() {
      const marker = markerRef.current;
      if (!marker) return;
      const latlng = marker.getLatLng();
      setPosition([latlng.lat, latlng.lng]);
      fetchAddressFromCoords(latlng.lat, latlng.lng);
    },
  }).current;

  // Search Logic
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const applyPlace = (place) => {
    const props = place.properties;
    const newLat = props.lat;
    const newLon = props.lon;

    setPosition([newLat, newLon]);
    setAdress(props.formatted || "");
    setCitys(props.city || props.suburb || "");
    setState(props.state || "");
    setBuildingName(props.name || "");
    setAreaName(props.suburb || props.city || props.state || "");

    setSearchQuery(props.formatted);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchSuggestions = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query,
          )}&limit=6&apiKey=${GEOAPIFY_API_KEY}`,
        );
        const result = await response.json();
        setSuggestions(result.features || []);
      } catch (err) {
        console.log(err);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Image Preview
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("address", address);
      formData.append("city", citys);
      formData.append("state", state);
      formData.append("description", description);
      formData.append("latitude", lat);
      formData.append("longitude", lon);
      if (backendImage instanceof File) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        {
          withCredentials: true,
        },
      );

      dispatch(setMyShopData(result.data.shop));
      setIsLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* glow bg */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200/30 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300/20 blur-3xl rounded-full" />

      {/* back button */}
      <motion.div
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-orange-100 flex items-center justify-center hover:bg-white transition-all">
          <IoArrowBackOutline
            size={22}
            className="sm:w-7 sm:h-7 text-[#ff4d2d] stroke-[2.5]"
          />
        </div>
      </motion.div>

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-orange-100 shadow-2xl rounded-[32px] overflow-hidden pb-4">
          {/* top banner */}
          <div className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 px-8 py-10 text-white">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white/20 border border-white/20 flex items-center justify-center shadow-lg mb-5">
                <FaUtensils className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight">
                {myShopData ? "Edit Shop" : "Create Shop"}
              </h1>

              <p className="text-orange-50 text-sm mt-2">
                Build your restaurant storefront beautifully.
              </p>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-7">
            {/* MAP SECTION INJECTED HERE */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 block">
                Pinpoint Restaurant Location
              </label>

              {/* SEARCH BAR + SUGGESTIONS */}
              <div ref={searchWrapRef} className="relative z-50">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-4 focus-within:ring-orange-100 focus-within:border-[#ff4d2d] focus-within:bg-white transition-all">
                  <FiSearch className="text-gray-400 shrink-0" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search area, street or landmark..."
                    className="flex-1 bg-transparent outline-none text-sm md:text-base font-medium placeholder:text-gray-400 min-w-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition shrink-0 cursor-pointer"
                    >
                      <FiX size={15} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[1100]"
                    >
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-orange-50 transition border-b border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                          <FiNavigation className="text-[#ff4d2d]" size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-800">
                          Use my current location
                        </span>
                      </button>

                      {searchLoading && (
                        <div className="px-4 py-3.5 text-sm text-gray-400 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#ff4d2d] animate-spin" />
                          Searching...
                        </div>
                      )}

                      {!searchLoading &&
                        searchQuery &&
                        suggestions.length === 0 && (
                          <div className="px-4 py-3.5 text-sm text-gray-400">
                            No matches found
                          </div>
                        )}

                      {!searchLoading &&
                        suggestions.map((place) => (
                          <button
                            type="button"
                            key={place.properties.place_id}
                            onClick={() => applyPlace(place)}
                            className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                          >
                            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                              <FiMapPin className="text-gray-500" size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">
                                {place.properties.name ||
                                  place.properties.formatted}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-1">
                                {place.properties.formatted}
                              </p>
                            </div>
                          </button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MAP VISUALIZATION AREA */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm z-0">
                <div className="h-56 md:h-72 w-full relative">
                  <MapContainer
                    center={[22.5726, 88.3639]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {!isNaN(lat) && !isNaN(lon) && (
                      <>
                        <MapUpdater lat={lat} lon={lon} />
                        <Marker
                          ref={markerRef}
                          position={[lat, lon]}
                          icon={customIcon}
                          draggable
                          eventHandlers={eventHandlers}
                        />
                      </>
                    )}
                  </MapContainer>

                  <AnimatePresence>
                    {!addressLoading && buildingName && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-3 left-3 z-[1000] max-w-[70%] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-gray-100"
                      >
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {buildingName}
                        </p>
                        {areaName && (
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            {areaName}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="absolute bottom-3 right-3 z-[1000] w-11 h-11 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
                  >
                    <FiCrosshair
                      size={20}
                      className={
                        isDetecting
                          ? "animate-spin text-[#ff4d2d]"
                          : "text-gray-700"
                      }
                    />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* shop name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Shop Name
              </label>
              <input
                type="text"
                placeholder="Enter shop name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* image */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Shop Image
              </label>

              <label className="border-2 border-dashed border-orange-200 bg-orange-50/60 hover:bg-orange-50 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden">
                {frontendImage ? (
                  <img
                    src={frontendImage}
                    alt="shop"
                    className="w-full h-52 object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                      <MdOutlineImage className="text-[#ff4d2d] w-8 h-8" />
                    </div>
                    <p className="font-semibold text-gray-700">
                      Upload restaurant image
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG or WEBP
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                />
              </label>
            </div>

            {/* city & state */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* city */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  City
                </label>
                <div className="relative">
                  <HiOutlineLocationMarker className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={citys}
                    onChange={(e) => setCitys(e.target.value)}
                    className="w-full h-14 pl-11 pr-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* state */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  State / Region
                </label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* address */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Street Address
              </label>
              <textarea
                rows={1}
                placeholder="Enter full street address"
                value={address}
                onChange={(e) => setAdress(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 resize-none focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Description
              </label>
              <textarea
                rows={1}
                placeholder="Write something about your restaurant..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 resize-none focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* shop info */}
            {myShopData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500">Rating</p>
                  <h3 className="font-bold text-[#ff4d2d] text-lg">
                    {myShopData.rating || 0}
                  </h3>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500">Reviews</p>
                  <h3 className="font-bold text-[#ff4d2d] text-lg">
                    {myShopData.totalReviews || 0}
                  </h3>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500">Delivery</p>
                  <h3 className="font-bold text-[#ff4d2d] text-lg">
                    {myShopData.deliveryTime || 30}m
                  </h3>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500">Status</p>
                  <h3 className="font-bold text-[#ff4d2d] text-lg">
                    {myShopData.isOpen ? "Open" : "Closed"}
                  </h3>
                </div>
              </div>
            )}

            {/* submit button */}
            <motion.button
              whileHover={
                !isLoading
                  ? {
                      scale: 1.01,
                      boxShadow: "0px 20px 40px rgba(255, 77, 45, 0.25)",
                      filter: "brightness(1.04)",
                    }
                  : {}
              }
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white font-semibold text-base tracking-wide flex items-center justify-center cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <GrUpdate className="animate-spin text-lg" />
                    <span>{myShopData ? "Updating..." : "Creating..."}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <GrUpdate className="text-lg" />
                    <span>{myShopData ? "Update Shop" : "Create Shop"}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEditShop;
