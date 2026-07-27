import { Navigate, Route, Routes } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Signup from "./pages/signup";
import Signin from "./pages/signin";
import ForgotPassword from "./pages/forgotPassword";
import Home from "./pages/home";
import SelectedRole from "./pages/selectedRole";
import CreateEditShop from "./pages/createEditShop";
import AddItem from "./pages/addItem";
import EditItem from "./pages/editItem";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrder from "./pages/myOrder";

import AllRestaurantCard from "./components/AllRestunantcard";
import MenuCard from "./components/menuCard";
import Cart from "./components/Cart";
import DeliveryAddressPage from "./components/DeliveryAddressPage";
import MultiCart from "./components/Multicart";

import FloatingCartBar from "./components/FloatingCart";
import CartBottomSheet from "./components/CartBottomSheet";

import useGetCurrentUser from "./hooks/userGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetByCity from "./hooks/useGetByCity";
import useGetItemByCity from "./hooks/useGetItemByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import UseUpdateLocation from "./hooks/useupdateLocation";

export const serverUrl = import.meta.env.VITE_BASE_URL;

//GLASS TOAST
export const glassToast = (message, type = "success") => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-sm w-full bg-slate-900/90 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-700/50 rounded-2xl pointer-events-auto flex items-center gap-3 px-5 py-3.5`}
      >
        {type === "success" ? (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FiCheckCircle size={18} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <FiAlertCircle size={18} />
          </div>
        )}
        <span className="text-sm font-semibold text-white tracking-wide">
          {message}
        </span>
      </div>
    ),
    { duration: 3000, position: "top-center" },
  );
};

const App = () => {
  const { userData, city, userLoading, cityLoading, shopLoading, itemLoading } =
    useSelector((state) => state.user);

  // GLOBAL CART SHEET STATE
  const [showCartSheet, setShowCartSheet] = useState(false);
  const isOwner = userData?.role === "owner";
  useEffect(() => {
    const handleOpen = () => setShowCartSheet(true);

    window.addEventListener("open-cart-sheet", handleOpen);

    return () => {
      window.removeEventListener("open-cart-sheet", handleOpen);
    };
  }, []);

  useGetCurrentUser();
  UseUpdateLocation()
  useGetCity();
  useGetMyShop();
  useGetByCity();
  useGetItemByCity(city?.city);
  useGetMyOrders();

  const loading = userLoading || cityLoading || shopLoading || itemLoading;

  const location = useLocation();

  const hideFloatingCart =
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/multi-cart") ||
    location.pathname.startsWith("/menu") ||
    location.pathname.startsWith("/DeliveryAddressPage");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-600 [animation-delay:-0.3s]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <Signup /> : <Navigate to="/" />}
        />

        <Route
          path="/signin"
          element={!userData ? <Signin /> : <Navigate to="/" />}
        />

        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={
            userData ? (
              userData.isProfileComplete ? (
                <Home />
              ) : (
                <Navigate to="/select-role" />
              )
            ) : (
              <Navigate to="/signin" />
            )
          }
        />

        <Route
          path="/select-role"
          element={
            userData ? (
              !userData.isProfileComplete ? (
                <SelectedRole />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/signin" />
            )
          }
        />

        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to="/" />}
        />

        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to="/signin" />}
        />

        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to="/signin" />}
        />

        <Route
          path="/all-restaurants"
          element={userData ? <AllRestaurantCard /> : <Navigate to="/signin" />}
        />

        <Route
          path="/menu/:id"
          element={userData ? <MenuCard /> : <Navigate to="/signin" />}
        />

        <Route path="/cart/:shopId" element={<Cart />} />
        <Route path="/multi-cart" element={<MultiCart />} />
        <Route path="/DeliveryAddressPage" element={<DeliveryAddressPage />} />
        <Route
          path="/DeliveryAddressPage/:id"
          element={<DeliveryAddressPage />}
        />
        <Route path="/order" element={<OrderPlaced />} />
        <Route path="/my-order" element={<MyOrder />} />
      </Routes>

      {/* GLOBAL CART */}

      {!isOwner && !hideFloatingCart && (
        <>
          <FloatingCartBar onOpen={() => setShowCartSheet(true)} />
          <CartBottomSheet
            open={showCartSheet}
            onClose={() => setShowCartSheet(false)}
          />
        </>
      )}

      <Toaster />
    </>
  );
};

export default App;
