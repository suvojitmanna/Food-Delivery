import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
    addItem,
    deleteItem,
    editItem,
    getSingleItem,
} from "../controllers/item.controller.js";
import upload from "../middleware/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/:itemId", isAuth, getSingleItem);
export default itemRouter;