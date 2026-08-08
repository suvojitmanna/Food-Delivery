import { useEffect, useState } from "react";
import axios from "axios";
import { setShopLoading, setShopInMyCity } from "../redux/userSlice";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";

const useGetByCity = () => {
  const dispatch = useDispatch();

  // Redux fallback location
  const cityData = useSelector((state) => state.user.city);

  // Location selected from Change Location page
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedLocation");

      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Location parse error:", error);

      return null;
    }
  });

  // Listen for Navbar
  useEffect(() => {
    const handleLocationChanged = (event) => {
      console.log("📍 New selected location:", event.detail);

      if (event.detail) {
        setSelectedLocation(event.detail);
      }
    };

    window.addEventListener("locationChanged", handleLocationChanged);

    return () => {
      window.removeEventListener("locationChanged", handleLocationChanged);
    };
  }, []);

  const city =
    selectedLocation?.city ||
    cityData?.city ||
    cityData?.town ||
    cityData?.county ||
    "";

  useEffect(() => {
    if (!city) {
      dispatch(setShopInMyCity([]));
      return;
    }

    const fetchShop = async () => {
      try {
        dispatch(setShopLoading(true));

        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${encodeURIComponent(city)}`,
          {
            withCredentials: true,
          },
        );
        dispatch(setShopInMyCity(result.data.shops || []));
      } catch (error) {
        console.error("❌ Fetch shop error:", error);

        dispatch(setShopInMyCity([]));
      } finally {
        dispatch(setShopLoading(false));
      }
    };

    fetchShop();
  }, [city, dispatch]);
};

export default useGetByCity;
