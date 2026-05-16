import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { serverUrl } from "../src/App";
import { useDispatch } from "react-redux";
import { setUserData } from "../src/redux/userSlice";

const userGetCurrentuser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);
};

export default userGetCurrentuser;
