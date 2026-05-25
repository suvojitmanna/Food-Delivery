import React, { useEffect, useState } from "react";
import { FaUtensils } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineImage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { GrUpdate } from "react-icons/gr";

const CreateEditShop = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const { city } = useSelector((state) => state.user);
  console.log(city);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAdress] = useState(myShopData?.address || "");
  const [citys, setCitys] = useState(myShopData?.city || "");
  const [state, setState] = useState(myShopData?.state || "");
  const [description, setDescription] = useState(myShopData?.description || "");
  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!myShopData && city) {
      setCitys(city?.city || "");
      setState(city?.state || "");

      // full address
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
    }
  }, [city, myShopData]);

  // image preview
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBackendImage(file);

      // preview image
      setFrontendImage(URL.createObjectURL(file));
    }
  };
  // submit
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
        <div className="bg-white/90 backdrop-blur-xl border border-orange-100 shadow-2xl rounded-[32px] overflow-hidden">
          {/* top */}
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
              {/* shimmer effect */}
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
