import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/signup";
import Signin from "./pages/signin";
import ForgotPassword from "./pages/forgotPassword";
import useGetCurrentUser from "./hooks/userGetCurrentUser";
import { useSelector } from "react-redux";
import Home from "./pages/home";
import SelectedRole from "./pages/selectedRole";
import CreateEditShop from "./pages/createEditShop";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import AddItem from "./pages/addItem";
import EditItem from "./pages/editItem";
import useGetByCity from "./hooks/useGetByCity";
import useGetItemByCity from "./hooks/useGetItemByCity";
import AllRestaurantCard from "./components/AllRestunantcard";
import MenuCard from "./components/menuCard";
import Cart from "./components/Cart";
import DeliveryAddressPage from "./components/DeliveryAddressPage";

export const serverUrl = import.meta.env.VITE_BASE_URL;

const App = () => {
  const { userData, city, userLoading, cityLoading, shopLoading, itemLoading } =
    useSelector((state) => state.user);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetByCity();
  useGetItemByCity(city?.city);
  const loading = userLoading || cityLoading || shopLoading || itemLoading;
  useGetItemByCity(city?.city);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 ">
        <div className="flex space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-600 [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
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
        <Route path="/DeliveryAddressPage" element={<DeliveryAddressPage />} />
        <Route path="/DeliveryAddressPage/:id" element={<DeliveryAddressPage />} />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
