import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/signup";
import Signin from "./pages/signin";
import ForgotPassword from "./pages/forgotPassword";
import userGetCurrentuser from "../hooks/userGetCurrentuser";
import { useSelector } from "react-redux";
import Home from "./pages/home";

export const serverUrl = import.meta.env.VITE_BASE_URL;

const App = () => {
  userGetCurrentuser();
  const { userData } = useSelector((state) => state.user);
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
          element={userData ? <Home /> : <Navigate to="/signin" />}
        />
      </Routes>

      {/* Toast */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
