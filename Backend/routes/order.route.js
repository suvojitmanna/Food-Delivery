import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { deleteOrder, getPlaceOrder, placeOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();
orderRouter.post("/place-order", isAuth, placeOrder)
orderRouter.get("/my-orders", isAuth, getPlaceOrder)
orderRouter.delete("/:id", deleteOrder)

export default orderRouter;