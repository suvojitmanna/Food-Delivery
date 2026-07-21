import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoyDashboard from "../components/DeliveryBoyDashboard";
import FloatingCartBar from "../components/FloatingCart";
import CartBottomSheet from "../components/CartBottomSheet";
import { useState } from "react";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCartSheet, setShowCartSheet] = useState(false);
  return (
    <div className="w-[100vw] min-h-[100vh] pt-[50px] flex flex-col items-center bg-[#fff9f6]">
      {userData?.role === "user" && <UserDashboard />}

      {userData?.role === "owner" && <OwnerDashboard />}

      {userData?.role === "deliveryBoy" && <DeliveryBoyDashboard />}
      <FloatingCartBar onOpen={() => setShowCartSheet(true)} />

      <CartBottomSheet open={showCartSheet}
        onClose={() => setShowCartSheet(false)}
      />
    </div>
  );
};

export default Home;
