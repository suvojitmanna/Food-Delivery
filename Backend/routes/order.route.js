import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { acceptOrder, deleteOrder, getAssignment, getCurrentOrder, getDeliveryAssignment, getPlaceOrder, placeOrder, updateOrderStatus } from "../controllers/order.controller.js";

const orderRouter = express.Router();
orderRouter.post("/place-order", isAuth, placeOrder)
orderRouter.get("/my-orders", isAuth, getPlaceOrder)
orderRouter.get("/get-assignment", isAuth, getDeliveryAssignment)
orderRouter.get("/get-current-order", isAuth, getCurrentOrder)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus)
orderRouter.get("/assignment/:assignmentId", isAuth, getAssignment);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.delete("/:id", deleteOrder)

export default orderRouter;