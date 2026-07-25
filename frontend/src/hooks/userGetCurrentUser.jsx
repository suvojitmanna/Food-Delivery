import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserLoading, setUserData } from "../redux/userSlice";
import { clearAllCart } from "../redux/cartSlice";
import { serverUrl } from "../App";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      dispatch(setUserLoading(true));

      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(result.data.user));

        // Clear previous user's cart
        dispatch(clearAllCart());
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null));

        // Also clear cart if user is not authenticated
        dispatch(clearAllCart());
      } finally {
        dispatch(setUserLoading(false));
      }
    };

    fetchCurrentUser();
  }, [dispatch]);
};

export default useGetCurrentUser;