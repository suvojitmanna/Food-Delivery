import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoading, setMyShopData } from "../redux/ownerSlice";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";

const useGetMyShop = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    if (!userData) {
      dispatch(setMyShopData(null));
      return;
    }

    const fetchMyShop = async () => {
      try {
        dispatch(setLoading(true));

        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
        });

        dispatch(setMyShopData(result.data.shop || null));
      } catch {
        dispatch(setMyShopData(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMyShop();
  }, [dispatch, userData]);
};

export default useGetMyShop;
