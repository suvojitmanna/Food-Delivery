import React, { useState } from "react";
import { FaPlus, FaBowlFood } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { serverUrl } from "../App";
import axios from "axios";

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
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
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

      console.log("Dish successfully added:", result.data);
      navigate("/");
    } catch (error) {
      console.error("Failed to add menu item:", error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-orange-100 shadow-2xl rounded-[32px] overflow-hidden">
          {/* Accent Header Banner */}
          <div
            className="relative px-8 py-10 text-white overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: myShopData?.image
                ? `linear-gradient(to right, rgba(255, 77, 45, 0.95), rgba(249, 115, 22, 0.85)), url(${myShopData.image})`
                : "linear-gradient(to right, #ff4d2d, #f97316)",
            }}
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white/20 border border-white/20 flex items-center justify-center shadow-lg mb-5 overflow-hidden">
                {myShopData?.image ? (
                  <img
                    src={myShopData.image}
                    alt="Shop Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaBowlFood className="w-10 h-10 text-white" />
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight">
                Add New Item
              </h1>
              <p className="text-orange-50 text-sm mt-2 text-center">
                {myShopData?.name
                  ? `Adding to ${myShopData.name}`
                  : "Populate your digital storefront with items."}
              </p>
            </div>
          </div>

          {/* Form */}
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaPlus className="text-sm" />
              {loading ? "Saving Item..." : "Publish Item to Menu"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddItem;
