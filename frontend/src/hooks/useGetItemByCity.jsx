import { useEffect, useRef } from "react";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import { setLoading, setItemsInMyCity } from "../redux/userSlice";

import { serverUrl } from "../App";

const useGetItemByCity = () => {
  const dispatch = useDispatch();
  const fetchedRef = useRef(false);
  const userState = useSelector((state) => state.user);

  // SAFE CITY
  const city = userState?.city?.city || userState?.city || "";
  useEffect(() => {
    if (!city || fetchedRef.current) return;
    fetchedRef.current = true;
    const fetchItems = async () => {
      try {
        dispatch(setLoading(true));
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${city}`,
          {
            withCredentials: true,
          },
        );
        if (result.data.success) {
          dispatch(setItemsInMyCity(result.data.items || []));
        }
        console.log("ITEMS:", result.data.items);
      } catch (error) {
        console.log(
          "Get Items By City Error:",
          error.response?.data || error.message,
        );

        dispatch(setItemsInMyCity([]));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchItems();
  }, [city]);
  return null;
};

export default useGetItemByCity;
