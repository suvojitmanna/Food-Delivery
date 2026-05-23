import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";

const EditItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

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
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

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
          <div className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 px-8 py-8 text-white">
            <h1 className="text-3xl font-bold">Edit Item</h1>

            <p className="text-sm mt-2 text-orange-50">
              Update your food item details
            </p>
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white font-bold text-lg"
            >
              Update Item
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditItem;
