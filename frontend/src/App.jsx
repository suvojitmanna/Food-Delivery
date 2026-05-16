import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Signup from "./pages/signup";
import Signin from "./pages/signin";
import ForgotPassword from "./pages/forgotPassword";

console.log(import.meta.env.VITE_BASE_URL);
export const serverUrl = import.meta.env.VITE_BASE_URL;

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      {/* Toast */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
