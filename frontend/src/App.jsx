import React from "react";
import { Route, Routes } from "react-router-dom";
import Signup from "./pages/signup";
import Signin from "./pages/signin";

export const serverUrl = import.meta.env.VITE_BASE_URL;

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </div>
  );
};

export default App;