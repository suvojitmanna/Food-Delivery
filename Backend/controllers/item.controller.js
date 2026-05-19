import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            originalPrice,
            category,
            type,
            isAvailable,
            isFeatured,
            rating,
            totalReviews,
            preparationTime,
        } = req.body;
        if (
            !name ||
            !price ||
            !category ||
            !type ||
            !req.file
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Find shop of logged-in owner
        const shop = await Shop.findOne({
            owner: req.userId,
        });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }
        // Upload image
        let imageUrl = "";
        if (req.file) {
            const uploadedImage =
                await uploadOnCloudinary(req.file.path);

            imageUrl = uploadedImage.secure_url;
        }
        if (!imageUrl) {
            return res.status(500).json({
                success: false,
                message: "Image upload failed",
            });
        }

        // Create item
        const item = await Item.create({
            name,
            image: imageUrl,
            description,
            price,
            originalPrice,
            category,
            shop: shop._id,
            type,
            isAvailable,
            isFeatured,
            rating,
            totalReviews,
            preparationTime,
        });

        shop.items.push(item._id);
        await shop.save();
        await item.populate("shop");
        return res.status(201).json({
            success: true,
            message: "Item added successfully",
            item,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const editItem = async (req, res) => {
    try {
        const { itemId } = req.params.itemId;
        const {
            name,
            description,
            price,
            originalPrice,
            category,
            type,
            isAvailable,
            isFeatured,
            rating,
            totalReviews,
            preparationTime,
        } = req.body;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }
        const shop = await Shop.findOne({
            owner: req.userId,
        });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }

        // Security check
        if (
            item.shop.toString() !==
            shop._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to edit this item",
            });
        }

        // Existing image
        let imageUrl = item.image;
        // Upload new image
        if (req.file) {
            const uploadedImage =
                await uploadOnCloudinary(req.file.path);

            imageUrl = uploadedImage.secure_url;
        }
        // Update item
        item.name = name || item.name;
        item.image = imageUrl || item.image;
        item.description = description || item.description;
        item.price = price || item.price;
        item.originalPrice = originalPrice || item.originalPrice;
        item.category =  category || item.category;
        item.type = type || item.type;
        item.isAvailable = typeof isAvailable === "boolean" ? isAvailable : item.isAvailable;
        item.isFeatured = typeof isFeatured === "boolean" ? isFeatured : item.isFeatured;
        item.rating =  rating || item.rating;
        item.totalReviews = totalReviews || item.totalReviews;
        item.preparationTime = preparationTime || item.preparationTime;

        // Save updated item
        await item.save();
        await item.populate("shop");
        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};