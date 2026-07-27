import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCity } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEO_API_KEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          dispatch(setLocation({ lat: latitude, lon: longitude }));

          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`,
          );

          const locationData = result.data.features[0].properties;
          dispatch(setCity(locationData));
          const results = result?.data?.features[0].properties.address_line2;
          console.log("user Location:", result);
          dispatch(setAddress(results));
        } catch (error) {
          console.log(error);
        }
      },
      (error) => {
        console.log(error);
      },
    );
  }, [dispatch]);

  return null;
};

export default useGetCity;
