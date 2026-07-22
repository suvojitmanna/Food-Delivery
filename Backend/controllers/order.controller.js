import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";

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

        if (!deliveryAddress || !deliveryAddress.text || deliveryAddress.latitude == null || deliveryAddress.longitude == null
        ) {
            return res.status(400).json({
                message: "Send complete delivery address",
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
                        item: item._id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                };
            })
        );

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders,
        });

        return res.status(201).json({
            success: true,
            order: newOrder,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};