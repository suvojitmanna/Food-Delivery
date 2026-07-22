import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setItemsInMyCity,
  setItemLoading,
} from "../redux/userSlice";
import { serverUrl } from "../App";

const useGetItemByCity = () => {
  const dispatch = useDispatch();

  const cityData = useSelector((state) => state.user.city);

  const city =
    cityData?.city ||
    cityData?.town ||
    cityData?.state_district ||
    cityData?.county ||
    "";

  useEffect(() => {
    if (!city) return;

    const fetchItems = async () => {
      try {
        dispatch(setItemLoading(true));

        console.log("Fetching items for:", city);

        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${encodeURIComponent(city)}`,
          {
            withCredentials: true,
          },
        );

        dispatch(setItemsInMyCity(result.data.items || []));
      } catch (error) {
        console.error(
          "Get Items By City Error:",
          error.response?.data || error.message,
        );

        dispatch(setItemsInMyCity([]));
      } finally {
        dispatch(setItemLoading(false));
      }
    };

    fetchItems();
  }, [city, dispatch]);

  return null;
};

export default useGetItemByCity;
