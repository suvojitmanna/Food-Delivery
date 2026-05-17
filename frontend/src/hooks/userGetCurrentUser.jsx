import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoading, setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });

        dispatch(setUserData(result.data.user));
      } catch (error) {
        console.log(error);

        dispatch(setUserData(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCurrentUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
