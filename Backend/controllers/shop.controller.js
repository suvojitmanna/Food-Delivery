import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createOrEditShop = async (req, res) => {
    try {
        const {
            name,
            city,
            state,
            address,
            description,
            rating,
            totalReviews,
            deliveryTime,
            deliveryFee,
            isOpen,
            categories,
            items,
        } = req.body;

        // Validation
        if (
            !name ||
            !city ||
            !state ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        let shop = await Shop.findOne({
            owner: req.userId,
        });

        let imageUrl = shop?.image || "";
        if (req.file) {
            const uploadedImage =
                await uploadOnCloudinary(req.file.path);

            imageUrl = uploadedImage.secure_url;
        }
        // CREATE SHOP 
        if (!shop) {
            if (!imageUrl) {
                return res.status(400).json({
                    success: false,
                    message: "Shop image is required",
                });
            }

            shop = await Shop.create({
                name,
                image: imageUrl,
                owner: req.userId,
                city,
                state,
                address,
                description,
                rating,
                totalReviews,
                deliveryTime,
                deliveryFee,
                isOpen,
                items,
                categories:
                    typeof categories === "string"
                        ? categories
                            .split(",")
                            .map((cat) =>
                                cat.trim()
                            )
                        : categories,
            });

            await shop.populate("owner");

            return res.status(201).json({
                success: true,
                message:
                    "Shop created successfully",
                shop,
            });
        }

        // UPDATE SHOP 
        shop.name = name || shop.name;
        shop.image = imageUrl || shop.image;
        shop.city = city || shop.city;
        shop.state = state || shop.state;
        shop.address = address || shop.address;
        shop.description = description || shop.description;
        shop.rating = rating || shop.rating;
        shop.totalReviews = totalReviews || shop.totalReviews;
        shop.deliveryTime = deliveryTime || shop.deliveryTime;
        shop.deliveryFee = deliveryFee || shop.deliveryFee;
        shop.isOpen = typeof isOpen === "boolean" ? isOpen : shop.isOpen;
        shop.items = items || shop.items;
        shop.categories =
            typeof categories === "string"
                ? categories
                    .split(",")
                    .map((cat) => cat.trim())
                : categories || shop.categories;
        // Save updated shop
        await shop.save();
        await shop.populate("owner");
        return res.status(200).json({
            success: true,
            message:
                "Shop updated successfully",
            shop,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const getMyShop = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(userId)
        const shop = await Shop.findOne({
            owner: userId,
        })
            .populate("owner")
            .populate("items");

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }

        return res.status(200).json({
            success: true,
            shop,
        });
    } catch (error) {
        console.log("Get My Shop Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};