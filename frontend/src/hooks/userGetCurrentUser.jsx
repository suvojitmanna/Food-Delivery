import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserLoading, setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      dispatch(setUserLoading(true));
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data.user));
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null));
      } finally {
        dispatch(setUserLoading(false));
      }
    };
    fetchCurrentUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
