import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderPage from "../components/userOrderPage";
import OwnerOrderPage from "../components/ownerOrderPage";
import { IoIosArrowRoundBack } from "react-icons/io";

const MyOrder = () => {
  const navigate = useNavigate();
  const { userData, myOrders,shopInMyCity } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-orange-50 transition"
          >
            <IoIosArrowRoundBack
              size={30}
              className="text-[#ff4d2d]"
            />
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            My Orders
          </h1>
        </div>

        {/* Content */}
        {userData?.role === "user" ? (
          <UserOrderPage orders={myOrders} shop={shopInMyCity} />
        ) : userData?.role === "owner" ? (
          <OwnerOrderPage orders={myOrders} />
        ) : (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            Unauthorized or invalid user role.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrder;