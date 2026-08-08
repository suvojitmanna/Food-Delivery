import React, { useState } from "react";
import { FaPlus, FaBowlFood } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";

const CATEGORIES = [
  "Pizza",
  "Burger",
  "Biryani",
  "Drinks",
  "Dessert",
  "Chinese",
  "Indian",
  "South Indian",
  "Fast Food",
  "Snacks",
  "Pasta",
  "Noodles",
  "Rolls & Wraps",
  "Sandwich",
  "Momos",
  "Shawarma",
  "Kebabs",
  "Chaats",
  "Thali",
  "Salad",
  "Healthy Food",
  "Waffles",
  "Cakes & Pastries",
  "Ice Cream",
  "Shakes & Smoothies",
  "Mexican",
  "Italian",
];

const AddItem = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- STATE VARIABLES ---
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [gst, setGst] = useState("");
  const [hasPackingFee, setHasPackingFee] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState("Veg");
  const [preparationTime, setPreparationTime] = useState(15);
  const [description, setDescription] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Local image file preview handler
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myShopData?._id) {
      alert("Please set up your shop profile first!");
      return;
    }
    if (!backendImage) {
      alert("Please upload an image for the dish.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("shop", myShopData._id);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("preparationTime", preparationTime);

      // Append the new fields to FormData
      if (gst) formData.append("gst", gst);
      formData.append("hasPackingFee", hasPackingFee);

      if (originalPrice) {
        formData.append("originalPrice", originalPrice);
      }
      if (backendImage instanceof File) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true },
      );

      dispatch(setMyShopData(result.data.shop));
      console.log(result);
      navigate("/");
    } catch (error) {
      console.error("Failed to add menu item:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() && price && category && type && backendImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200/30 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300/20 blur-3xl rounded-full" />

      {/* Navigation Back Button */}
      <motion.div
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-orange-100 flex items-center justify-center hover:bg-white transition-all">
          <IoArrowBackOutline
            size={22}
            className="sm:w-7 sm:h-7 text-[#ff4d2d] stroke-[2.5]"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-orange-100 shadow-2xl rounded-[32px] overflow-hidden">
          <div
            className="relative px-8 py-16 overflow-hidden rounded-[34px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.12)] group"
            style={{
              background: myShopData?.image
                ? `linear-gradient(135deg,rgba(10,10,10,0.82),rgba(24,24,27,0.75),rgba(255,77,45,0.18)),url(${myShopData.image})`
                : `radial-gradient(circle at top right, rgba(255,77,45,0.22), transparent 35%),radial-gradient(circle at bottom left, rgba(249,115,22,0.15), transparent 30%),linear-gradient(135deg, #18181b 0%, #09090b 100%)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 backdrop-blur-[2px]" />
            <div className="absolute -top-28 -right-20 w-72 h-72 bg-[#ff4d2d]/20 blur-[120px] rounded-full" />
            <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-orange-500/10 blur-[120px] rounded-full" />
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:28px_28px]" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 -left-[120%] h-full w-[60%] rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl group-hover:left-[140%] transition-all duration-[2500ms]" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              {/* avatar */}
              <div className="relative w-28 h-28 rounded-[28px] p-[1.5px] bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_10px_40px_rgba(0,0,0,0.25)] mb-6 group-hover:scale-105 transition-all duration-500">
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-[#ff4d2d]/30 to-orange-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

                <div className="relative w-full h-full rounded-[26px] overflow-hidden bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  {myShopData?.image ? (
                    <img
                      src={myShopData.image}
                      alt="Shop Avatar"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                      <FaBowlFood className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* badge */}
              <div className="mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-[0.25em] text-orange-200 font-semibold">
                Premium Dashboard
              </div>

              {/* title */}
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white text-center leading-tight">
                Add New Item
              </h1>

              {/* subtitle */}
              <p className="mt-4 text-sm sm:text-base text-zinc-300 text-center max-w-lg leading-relaxed font-medium">
                {myShopData?.name ? (
                  <>
                    Adding luxury dishes to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] via-orange-400 to-yellow-300 font-bold">
                      {myShopData.name}
                    </span>
                  </>
                ) : (
                  "Craft beautiful culinary experiences for your digital restaurant storefront."
                )}
              </p>
            </div>
          </div>

          {/* Corrected Single Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            {/* Name input */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Butter Chicken"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Selling Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Original Price{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (Optional strikeout)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Taxes & Charges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
              {/* GST Percentage */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  GST Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g., 5"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    className="w-full h-14 pl-5 pr-10 rounded-2xl border border-gray-200 bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    %
                  </span>
                </div>
              </div>

              {/* Packing Fee Toggle */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Extra Charges
                </label>
                <button
                  type="button"
                  onClick={() => setHasPackingFee(!hasPackingFee)}
                  className={`w-full h-14 px-5 rounded-2xl border transition-all flex items-center justify-between group ${
                    hasPackingFee
                      ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm shadow-orange-100"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-sm">
                    Apply ₹10 Packing Fee
                  </span>

                  {/* iOS-style Toggle Switch */}
                  <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center ${
                      hasPackingFee
                        ? "bg-orange-500"
                        : "bg-gray-200 group-hover:bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
                        hasPackingFee ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Category & Cook Time Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all cursor-pointer appearance-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Preparation Time{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (Minutes)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Food Type Selector (Veg vs Non-Veg mapping) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Food Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["Veg", "Non-Veg"].map((foodType) => (
                  <button
                    key={foodType}
                    type="button"
                    onClick={() => setType(foodType)}
                    className={`h-12 rounded-xl font-medium text-sm transition-all border ${
                      type === foodType
                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    {foodType}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Drag/Upload dropzone */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Dish Image *
              </label>
              <label className="border-2 border-dashed border-orange-200 bg-orange-50/60 hover:bg-orange-50 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden min-h-[160px]">
                {frontendImage ? (
                  <img
                    src={frontendImage}
                    alt="dish preview"
                    className="w-full h-44 object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                      <MdOutlineImage className="text-[#ff4d2d] w-6 h-6" />
                    </div>
                    <p className="font-semibold text-gray-700 text-sm">
                      Upload high-res menu photo
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      PNG, JPG or WEBP (Required)
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

            {/* Description textarea */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="List key ingredients, portions sizes, or heat ratings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 resize-none focus:bg-white focus:border-[#ff4d2d] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Submit Action */}
            <motion.button
              whileHover={
                !loading && isFormValid
                  ? {
                      scale: 1.01,
                      boxShadow: "0px 20px 40px rgba(255, 77, 45, 0.25)",
                    }
                  : {}
              }
              whileTap={!loading && isFormValid ? { scale: 0.98 } : {}}
              disabled={loading || !isFormValid}
              type="submit"
              className={`relative overflow-hidden w-full h-14 rounded-2xl text-white font-bold text-lg transition-all flex items-center justify-center gap-3 
                ${
                  loading || !isFormValid
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#ff4d2d] to-orange-500 shadow-lg shadow-orange-200 hover:shadow-orange-300 cursor-pointer"
                }`}
            >
              {/* shimmer */}
              {!loading && isFormValid && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}

              {loading ? (
                <>
                  <FaPlus className="text-sm animate-spin" />
                  <span>Publishing Item...</span>
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  <span>Publish Item to Menu</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddItem;
