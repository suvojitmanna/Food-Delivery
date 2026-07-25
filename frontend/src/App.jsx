import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

export const serverUrl = import.meta.env.VITE_BASE_URL;

const App = () => {
  const { userData, city, userLoading, cityLoading, shopLoading, itemLoading } =
    useSelector((state) => state.user);

  // GLOBAL CART SHEET STATE
  const [showCartSheet, setShowCartSheet] = useState(false);

  useEffect(() => {
    const handleOpen = () => setShowCartSheet(true);

    window.addEventListener("open-cart-sheet", handleOpen);

    return () => {
      window.removeEventListener("open-cart-sheet", handleOpen);
    };
  }, []);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetByCity();
  useGetItemByCity(city?.city);
  useGetMyOrders();

  const loading = userLoading || cityLoading || shopLoading || itemLoading;

  const location = useLocation();

  const hideFloatingCart =
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/multi-cart")
    ||location.pathname.startsWith("/menu")

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
      {userData?.role === "user" && !hideFloatingCart && (
        <>
          <FloatingCartBar onOpen={() => setShowCartSheet(true)} />

          <CartBottomSheet
            open={showCartSheet}
            onClose={() => setShowCartSheet(false)}
          />
        </>
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
