import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoyDashboard from "../components/DeliveryBoyDashboard";
import FloatingCartBar from "../components/FloatingCart";
import CartBottomSheet from "../components/CartBottomSheet";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCartSheet, setShowCartSheet] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setShowCartSheet(true);
    };

    window.addEventListener("open-cart-sheet", handleOpen);

    return () => {
      window.removeEventListener("open-cart-sheet", handleOpen);
    };
  }, []);

  return (
      <div className="w-screen min-h-screen pt-[50px] flex flex-col items-center bg-[#fff9f6]">
      {userData?.role === "user" && <UserDashboard />}

      {userData?.role === "owner" && <OwnerDashboard />}

      {userData?.role === "deliveryBoy" && <DeliveryBoyDashboard />}
    </div>
  );
};

export default Home;