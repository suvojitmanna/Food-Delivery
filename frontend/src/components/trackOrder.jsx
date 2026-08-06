import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const getTrackOrder = async () => {
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        {
          withCredentials: true,
        },
      );

      setOrder(data.order);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTrackOrder();
  }, [orderId]);
  return <div></div>;
};

export default TrackOrderPage;
