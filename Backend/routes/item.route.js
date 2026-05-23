import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
    addItem,
    editItem,
    getSingleItem,
} from "../controllers/item.controller.js";
import upload from "../middleware/multer.js";

const itemRouter = express.Router();
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/:itemId", isAuth, getSingleItem);

export default itemRouter;