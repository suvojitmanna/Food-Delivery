import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/signup";
import Signin from "./pages/signin";
import ForgotPassword from "./pages/forgotPassword";
import useGetCurrentUser from "./hooks/userGetCurrentUser";
import { useSelector } from "react-redux";
import Home from "./pages/home";
import SelectedRole from "./pages/selectedRole"

export const serverUrl = import.meta.env.VITE_BASE_URL;

const App = () => {
  useGetCurrentUser();

  const { userData, loading } = useSelector((state) => state.user);

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
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
