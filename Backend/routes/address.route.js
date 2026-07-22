import express from "express";
import {
  createDeliveryAddress,
  getDeliveryAddresses,
  getSingleDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
} from "../controllers/address.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const addressRouter = express.Router();

addressRouter.post("/", isAuth, createDeliveryAddress);
addressRouter.get("/", isAuth, getDeliveryAddresses);
addressRouter.get("/:id", isAuth, getSingleDeliveryAddress);
addressRouter.put("/:id", isAuth, updateDeliveryAddress);
addressRouter.delete("/:id", isAuth, deleteDeliveryAddress);

export default addressRouter;