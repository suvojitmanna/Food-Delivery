import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";
import { IoArrowBackOutline } from "react-icons/io5";
import { GrUpdate } from "react-icons/gr";
import { MdOutlineImage } from "react-icons/md";
import { useSelector } from "react-redux";

const EditItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { myShopData } = useSelector((state) => state.owner);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState("");

  // get old item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/${itemId}`, {
          withCredentials: true,
        });

        const item = result.data.item;

        setName(item.name || "");
        setPrice(item.price || "");
        setCategory(item.category || "");
        setType(item.type || "");
        setDescription(item.description || "");
        setFrontendImage(item.image || "");
      } catch (error) {
        console.log(error);
      }
    };

    fetchItem();
  }, [itemId]);

  // image preview
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  // update item
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("description", description);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      window.location.href = "/";
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const isFormValid = name.trim() && price && category && type;
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-10">
      {/* back button */}
      <motion.div
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 z-30 cursor-pointer"
      >
        <div className="w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center">
          <IoArrowBackOutline size={22} className="text-[#ff4d2d]" />
        </div>
      </motion.div>

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white shadow-2xl rounded-[30px] overflow-hidden border border-orange-100">
          {/* top */}
          <div className="relative h-60 overflow-hidden">
            <img
              src={myShopData?.image}
              alt="item"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45 flex flex-col justify-end px-8 py-6 text-white">
              <h1 className="text-3xl font-bold">Edit Item</h1>
              <p className="text-sm text-orange-100 mt-2">
                Update your food item details
              </p>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* image */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Item Image
              </label>

              <label className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                {frontendImage ? (
                  <img
                    src={frontendImage}
                    alt="item"
                    className="w-full h-56 object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center mb-4">
                      <MdOutlineImage className="text-[#ff4d2d] w-8 h-8" />
                    </div>

                    <p className="font-semibold text-gray-700">
                      Upload Item Image
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

            {/* item name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Item Name
              </label>

              <input
                type="text"
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:border-[#ff4d2d] outline-none"
              />
            </div>

            {/* price */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Price
              </label>

              <input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:border-[#ff4d2d] outline-none"
              />
            </div>

            {/* category */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Category
              </label>

              <input
                type="text"
                placeholder="Enter category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:border-[#ff4d2d] outline-none"
              />
            </div>

            {/* type */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Food Type
              </label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:border-[#ff4d2d] outline-none"
              >
                <option value="">Select Type</option>
                <option value="Veg">Veg</option>
                <option value="Non Veg">Non Veg</option>
              </select>
            </div>

            {/* description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Description
              </label>

              <textarea
                rows={4}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-5 rounded-2xl border border-gray-200 bg-gray-50 resize-none focus:border-[#ff4d2d] outline-none"
              />
            </div>

            {/* button */}
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
              className={`relative overflow-hidden w-full h-14 rounded-2xl text-white font-semibold text-base tracking-wide flex items-center justify-center transition-all ${
                isLoading || !isFormValid
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#ff4d2d] to-orange-500 cursor-pointer shadow-lg shadow-orange-200"
              }`}
            >
              {!isLoading && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}

              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <GrUpdate className="text-base animate-spin" />
                    <span>Updating...</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <GrUpdate className="text-base" />
                    <span>Update Item</span>
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

export default EditItem;
