import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";

const UseUpdateLocation = () => {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;

    const updateLocation = async (lat, lon) => {
      try {
        const result = await axios.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true },
        );

        console.log(result.data);
      } catch (error) {
        console.error(
          "Location update failed:",
          error.response?.data || error.message,
        );
      }
    };

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userData]);
};

export default UseUpdateLocation;
