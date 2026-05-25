import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoading, setMyShopData } from "../redux/ownerSlice";
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

        dispatch(setMyShopData(result.data.shop || null));
      } catch (error) {
        console.log(
          "Get My Shop Error:",
          error.response?.data || error.message,
        );

        dispatch(setMyShopData(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMyShop();
  }, [dispatch]);
};

export default useGetMyShop;
