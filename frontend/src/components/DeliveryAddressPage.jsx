import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCrosshair,
  FiHome,
  FiBriefcase,
  FiMapPin,
  FiCheck,
  FiSearch,
  FiX,
  FiNavigation,
  FiCheckCircle, // Added for toast
  FiAlertCircle, // Added for toast
} from "react-icons/fi";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { glassToast, serverUrl } from "../App";
import toast from "react-hot-toast"; // Imported react-hot-toast

// Custom pin
const customIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
      <div style="
        width:26px;
        height:26px;
        background:#16a34a;
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
        background:#16a34a;
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
    map.flyTo([lat, lon], 16, {
      duration: 1,
    });
  }, [lat, lon]);

  return null;
}

const DeliveryAddressPage = () => {
  const navigate = useNavigate();
  const { location } = useSelector((state) => state.map);
  const { id } = useParams();

  const [position, setPosition] = useState([
    Number(location?.lat) || 22.5726,
    Number(location?.lon) || 88.3639,
  ]);
  const lat = position[0];
  const lon = position[1];

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    receiverName: "",
    mobileNumber: "",
    flatNo: "",
    landmark: "",
    streetArea: "",
    buildingName: "",
    areaName: "",
    addressType: "Home",
    isDefault: false,
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);
  const markerRef = useRef(null);
  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEO_API_KEY;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    setAddressLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`,
      );
      const data = await response.json();
      if (data.features.length > 0) {
        const place = data.features[0].properties;
        setFormData((prev) => ({
          ...prev,
          streetArea: place.formatted,
          buildingName: place.name || "",
          areaName: place.suburb || place.city || place.state || "",
        }));
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

      if (
        location &&
        location.lat &&
        location.lon &&
        !isNaN(location.lat) &&
        !isNaN(location.lon)
      ) {
        const lat = Number(location.lat);
        const lon = Number(location.lon);

        setPosition([lat, lon]);
        await fetchAddressFromCoords(lat, lon);
        setShowSuggestions(false);

        glassToast("Current location detected.", "success");
        return;
      }
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

          switch (error.code) {
            case error.PERMISSION_DENIED:
              glassToast("Location permission denied.", "error");
              break;

            case error.POSITION_UNAVAILABLE:
              glassToast("Location unavailable.", "error");
              break;

            case error.TIMEOUT:
              glassToast(
                "Location request timed out. Using saved location if available.",
                "error",
              );
              break;

            default:
              glassToast("Unable to get current location.", "error");
          }
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
    setFormData((prev) => ({
      ...prev,
      streetArea: props.formatted,
      buildingName: props.name || "",
      areaName: props.suburb || props.city || props.state || "",
    }));
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

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          searchQuery,
        )}&apiKey=${GEOAPIFY_API_KEY}`,
      );
      const result = await response.json();

      if (!result.features?.length) {
        glassToast("Location not found", "error");
        return;
      }
      applyPlace(result.features[0]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getAddress = async () => {
      try {
        const { data } = await axios.get(
          `${serverUrl}/api/delivery-address/${id}`,
          {
            withCredentials: true,
          },
        );

        if (data.success) {
          const address = data.address;

          setFormData({
            receiverName: address.receiverName,
            mobileNumber: address.mobileNumber,
            flatNo: address.flatNo,
            landmark: address.landmark,
            streetArea: address.streetArea,
            buildingName: address.buildingName,
            areaName: address.areaName,
            addressType: address.addressType,
            isDefault: address.isDefault,
          });

          setPosition([address.latitude, address.longitude]);
          setIsEditing(true);
          setEditingId(address._id);
        }
      } catch (error) {
        console.error("Error fetching address details:", error);
      }
    };

    if (id) {
      getAddress();
    }
  }, [id]);

  const addressTypes = [
    { id: "Home", icon: FiHome, label: "Home" },
    { id: "Work", icon: FiBriefcase, label: "Work" },
    { id: "Other", icon: FiMapPin, label: "Other" },
  ];

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    try {
      if (!lat || !lon) {
        return glassToast("Please select a location on the map.", "error");
      }

      const payload = {
        receiverName: formData.receiverName,
        mobileNumber: formData.mobileNumber,
        flatNo: formData.flatNo,
        landmark: formData.landmark,
        streetArea: formData.streetArea,
        buildingName: formData.buildingName,
        areaName: formData.areaName,
        addressType: formData.addressType,
        latitude: lat,
        longitude: lon,
        isDefault: formData.isDefault,
      };

      let data;

      if (isEditing) {
        const res = await axios.put(
          `${serverUrl}/api/delivery-address/${editingId}`,
          payload,
          {
            withCredentials: true,
          },
        );
        data = res.data;
      } else {
        const res = await axios.post(
          `${serverUrl}/api/delivery-address`,
          payload,
          {
            withCredentials: true,
          },
        );
        data = res.data;
      }

      if (data.success) {
        glassToast("Address saved successfully!", "success");
        navigate(-1);
      }
    } catch (error) {
      console.log(error);
      glassToast(
        error.response?.data?.message || "Failed to save address.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans md:pb-40">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 pt-safe shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg md:text-xl">
            {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
          </h1>
        </div>
      </header>

      {/* SEARCH BAR + SUGGESTIONS */}
      <div
        className="max-w-3xl mx-auto px-4 pt-4 md:pt-6 relative"
        ref={searchWrapRef}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-4 focus-within:ring-black/5 focus-within:border-black transition-all"
        >
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shrink-0 cursor-pointer"
            >
              <FiX size={15} />
            </button>
          )}
        </form>

        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-4 right-4 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[1100]"
            >
              <button
                type="button"
                onClick={handleDetectLocation}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition border-b border-gray-100"
              >
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <FiNavigation className="text-green-600" size={14} />
                </div>
                <span className="text-sm font-bold text-gray-800">
                  Use my current location
                </span>
              </button>

              {searchLoading && (
                <div className="px-4 py-3.5 text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
                  Searching...
                </div>
              )}

              {!searchLoading && searchQuery && suggestions.length === 0 && (
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
                        {place.properties.name || place.properties.formatted}
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
      <div className="max-w-3xl mx-auto px-4 mt-4 md:mt-6">
        <div className="rounded-xl border border-gray-200 overflow-hidden relative shadow-sm">
          <div className="h-56 md:h-72 w-full relative">
            <MapContainer
              center={position}
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

            {/* Building / area name tag */}
            <AnimatePresence>
              {!addressLoading && formData.buildingName && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-3 left-3 z-[1000] max-w-[70%] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-gray-100"
                >
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {formData.buildingName}
                  </p>
                  {formData.areaName && (
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {formData.areaName}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Locate-me button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              className="absolute bottom-3 right-3 z-[1000] w-11 h-11 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
            >
              <FiCrosshair
                size={20}
                className={
                  isDetecting ? "animate-spin text-green-600" : "text-gray-700"
                }
              />
            </button>
          </div>
        </div>

        {/* DELIVERY LOCATION DISPLAY */}
        <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-3 md:gap-4 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <FiMapPin className="text-green-600" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm md:text-base">
              Delivery Location
            </h3>
            {addressLoading ? (
              <div className="mt-2 space-y-2">
                <div className="h-2 md:h-2.5 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-2 md:h-2.5 w-1/2 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-sm md:text-base font-semibold text-gray-800 truncate mt-0.5">
                  {formData.buildingName || "Selected location"}
                </p>
                <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mt-0.5 md:mt-1">
                  {formData.areaName ||
                    formData.streetArea ||
                    "Drag the pin, search above, or use your current location"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <form
          onSubmit={handleSaveAddress}
          className="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-8 space-y-8 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] md:border border-gray-100"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Enter Address Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Receiver Name */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Receiver Name
                </label>

                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Enter Phone Number
                </label>

                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black"
                  required
                />
              </div>

              {/* Flat */}
              <div>
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Flat / House No.
                </label>

                <input
                  type="text"
                  name="flatNo"
                  value={formData.flatNo}
                  onChange={handleChange}
                  placeholder="Flat 4B"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black"
                  required
                />
              </div>

              {/* Building */}
              <div>
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Building Name
                </label>

                <input
                  type="text"
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleChange}
                  placeholder="Building Name"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3.5"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Area
                </label>

                <input
                  type="text"
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                  placeholder="Area"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3.5"
                />
              </div>

              {/* Landmark */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Landmark
                </label>

                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Near City Mall"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black"
                />
              </div>

              {/* Street */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-xs font-bold uppercase text-gray-500">
                  Street / Area / Locality
                </label>

                <textarea
                  rows={3}
                  name="streetArea"
                  value={formData.streetArea}
                  onChange={handleChange}
                  placeholder="Salt Lake Sector V"
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Address Type */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Save Address As</h3>

            <div className="flex flex-wrap gap-3">
              {addressTypes.map((type) => {
                const Icon = type.icon;
                const active = formData.addressType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        addressType: type.id,
                      })
                    }
                    className={`flex items-center gap-2 rounded-full px-5 py-3 border transition ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    {type.label}
                    {active && <FiCheck size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Address */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                Set as Default Address
              </h4>

              <p className="text-sm text-gray-500">
                This address will be selected automatically during checkout.
              </p>
            </div>

            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isDefault: e.target.checked,
                })
              }
              className="h-5 w-5 accent-black cursor-pointer"
            />
          </div>
        </form>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pb-safe pointer-events-none md:p-4">
        <div className="w-full max-w-3xl bg-white border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] rounded-t-[30px] md:rounded-2xl p-4 md:p-5 pointer-events-auto">
          <button
            onClick={handleSaveAddress}
            className="w-full h-14 md:h-16 bg-emerald-500 text-white rounded-2xl md:rounded-xl font-bold text-lg md:text-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-green-600/30 cursor-pointer hover:bg-emerald-600"
          >
            {formData.addressType === "Home" ? (
              <FiHome size={20} />
            ) : formData.addressType === "Work" ? (
              <FiBriefcase size={20} />
            ) : (
              <FiMapPin size={20} />
            )}
            {isEditing ? "Update Address" : "Save Address & Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressPage;
