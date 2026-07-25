import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setMyOrders } from "../redux/userSlice";
import { setLoading } from "../redux/ownerSlice";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) {
      dispatch(setMyOrders([]));
      return;
    }

    const fetchMyOrders = async () => {
      try {
        dispatch(setLoading(true));

        const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(data.orders || []));
      } catch (error) {
        console.error("Fetch Orders Error:", error);
        dispatch(setMyOrders([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMyOrders();
  }, [dispatch, userData]);
};

export default useGetMyOrders;
