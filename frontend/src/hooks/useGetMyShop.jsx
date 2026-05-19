import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { setLoading, setMyShop } from "../redux/ownerSlice";

import { serverUrl } from "../App";

const useGetMyShop = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMyShop = async () => {
      try {
        dispatch(setLoading(true));

        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
        });

        if (result.data.success) {
          dispatch(setMyShop(result.data.shop));
        }
      } catch (error) {
        console.log(
          "Get My Shop Error:",
          error.response?.data || error.message,
        );

        dispatch(setMyShop(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMyShop();
  }, [dispatch]);
};

export default useGetMyShop;
