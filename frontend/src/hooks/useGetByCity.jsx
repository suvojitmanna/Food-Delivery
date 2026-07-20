import { useEffect } from "react";
import axios from "axios";

import { setShopLoading, setShopInMyCity } from "../redux/userSlice";

import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";

const useGetByCity = () => {
  const dispatch = useDispatch();
  const cityData = useSelector((state) => state.user.city);
const city = cityData?.city || cityData?.town || cityData?.county || "";
  useEffect(() => {
    if (!city) return;
    const fetchShop = async () => {
      try {
        dispatch(setShopLoading(true));
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${city}`,
          {
            withCredentials: true,
          },
        );
        dispatch(setShopInMyCity(result.data.shops));
      } catch (error) {
        console.log(error);
        dispatch(setShopInMyCity([]));
      } finally {
        dispatch(setShopLoading(false));
      }
    };
    fetchShop();
  }, [city, dispatch]);
};

export default useGetByCity;
