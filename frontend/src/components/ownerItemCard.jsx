import axios from "axios";
import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

const ownerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDeleteItem = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this item? This action cannot be undone.",
    );

    if (!isConfirmed) return;
    try {
      const result = await axios.delete(
        `${serverUrl}/api/item/delete/${data._id}`,
        {
          withCredentials: true,
        },
      );

      dispatch(setMyShopData(result.data.shop));
      toast.success("Item Deleted");
    } catch (error) {
      console.log(error);
      toast.error("Item deletion failed");
    }
  };

  return (
    <div className="flex bg-white rounded-xl shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      <div className="w-36 flex-shrink-0 bg-gray-50 aspect-square">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1 min-w-0">
        {" "}
        {/* Added min-w-0 to allow text-truncation/clamping to work properly inside flex */}
        <div>
          <h2 className="text-base font-semibold text-[#ff4d2d] truncate">
            {data.name}
          </h2>

          {/* Meta details group */}
          <div className="text-sm text-gray-600 mt-0.5 space-y-0.5">
            <p>
              <span className="font-medium text-gray-700">Category: </span>
              {data.category}
            </p>
            <p>
              <span className="font-medium text-gray-700">Food Type: </span>
              {data.type}
            </p>
          </div>

          {/* Added Description Section */}
          {data.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-[#ff4d2d] font-bold text-lg">{data.price}</div>
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-full cursor-pointer text-[#ff4d2d] hover:bg-[#ff4d2d]/10 transition-colors"
              onClick={() => navigate(`/edit-item/${data._id}`)}
            >
              <FaPen size={16} />
            </div>
            <div
              className="p-2 rounded-full cursor-pointer text-[#ff4d2d] hover:bg-[#ff4d2d]/10 transition-colors"
              onClick={handleDeleteItem}
            >
              <FaTrashAlt size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ownerItemCard;
