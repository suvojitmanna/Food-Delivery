import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import DeliveryAddress from "../models/address.model.js";

export const placeOrder = async (req, res) => {
    try {
        const {
            cartItems,
            paymentMethod,
            deliveryAddress,
            totalAmount,
        } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: "Please select a delivery address",
            });
        }

        const groupedItems = {};

        cartItems.forEach((item) => {
            const shopId = item.shop;

            if (!groupedItems[shopId]) {
                groupedItems[shopId] = [];
            }

            groupedItems[shopId].push(item);
        });

        const shopOrders = await Promise.all(
            Object.keys(groupedItems).map(async (shopId) => {
                const shop = await Shop.findById(shopId).populate("owner");

                if (!shop) {
                    throw new Error("Shop not found");
                }

                const items = groupedItems[shopId];

                const subtotal = items.reduce(
                    (sum, item) =>
                        sum + Number(item.price) * Number(item.quantity),
                    0
                );

                return {
                    shop: shop._id,
                    owner: shop.owner._id,
                    subtotal,
                    deliveryFee: shop.deliveryFee || 0,
                    items: items.map((item) => ({
                        item: item.item || item._id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                };
            })
        );

        const createdOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders,
        });

        const order = await Order.findById(createdOrder._id)
            .populate("deliveryAddress")
            .populate("shopOrders.shop")
            .populate("shopOrders.owner");

        return res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getPlaceOrder = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let orders;

        if (user.role === "user") {
            // Customer orders
            orders = await Order.find({ user: req.userId })
                .populate("shopOrders.shop", "name image address")
                .populate("shopOrders.owner", "name email mobile")
                .sort({ createdAt: -1 });
        } else {
            // Shop owner orders
            orders = await Order.find({
                "shopOrders.owner": req.userId,
            })
                .populate("deliveryAddress")
                .populate("shopOrders.shop", "name image address")
                .populate("shopOrders.owner", "name email mobile")
                .populate("user", "name email mobile")
                .sort({ createdAt: -1 });
        }

        return res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders,
        });

    } catch (error) {
        console.error("Get Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders.",
            error: error.message,
        });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            orderId: id,
        });
    } catch (error) {
        console.error("Delete Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};