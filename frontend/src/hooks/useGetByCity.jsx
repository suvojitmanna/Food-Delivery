import { useEffect } from "react";
import axios from "axios";

import { setLoading, setShopInMyCity } from "../redux/userSlice";

import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";

const useGetByCity = () => {
  const dispatch = useDispatch();
  const { city } = useSelector((state) => state.user);
  useEffect(() => {
    if (!city) return;
    const fetchShop = async () => {
      try {
        dispatch(setLoading(true));
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
        dispatch(setLoading(false));
      }
    };
    fetchShop();
  }, [city, dispatch]);
};

export default useGetByCity;
