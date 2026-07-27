import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import DeliveryAddress from "../models/address.model.js";
import DeliverAssignment from "../models/deliveryAssignment.model.js";

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

        let orders = [];
        let filteredOrders = [];

        if (user.role === "user") {
            orders = await Order.find({ user: req.userId })
                .populate("deliveryAddress")
                .populate("shopOrders.shop", "name image address location")
                .populate("shopOrders.owner", "name email mobile")
                .sort({ createdAt: -1 });

            filteredOrders = orders;
        } else {
            orders = await Order.find({
                "shopOrders.owner": req.userId,
            })
                .populate("deliveryAddress")
                .populate("shopOrders.shop", "name image address location")
                .populate("shopOrders.owner", "name email mobile")
                .populate("user", "name email mobile")
                .sort({ createdAt: -1 });

            filteredOrders = orders.map((order) => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                deliveryAddress: order.deliveryAddress,
                createdAt: order.createdAt,
                shopOrders: order.shopOrders.filter((o) =>
                    o.owner._id.equals(req.userId)
                ),
            }));
        }

        return res.status(200).json({
            success: true,
            totalOrders: filteredOrders.length,
            orders: filteredOrders,
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

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId)
            .populate("deliveryAddress");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        const shopOrder = order.shopOrders.find(
            (o) => o.shop.toString() === shopId
        );

        if (!shopOrder) {
            return res.status(404).json({
                success: false,
                message: "Shop order not found",
            });
        }
        shopOrder.status = status;
        let deliveryBoyPayload = [];

        if (status === "out for delivery" && !shopOrder.assignment) {

            const { longitude, latitude } = order.deliveryAddress;
            const lng = Number(longitude);
            const lat = Number(latitude);

            if (Number.isNaN(lng) || Number.isNaN(lat)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid delivery coordinates",
                });
            }

            const nearbyDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat],
                        },
                        $maxDistance: 5000,
                    },
                },
            });


            const nearByIds = nearbyDeliveryBoys.map((b) => b._id);
            const busyIds = await DeliverAssignment.find({
                assignedTo: { $in: nearByIds },
                status: {
                    $in: ["accepted", "picked"],
                },
            }).distinct("assignedTo");
            const busyIdSet = new Set(
                busyIds.map((id) => String(id))
            );
            const availableBoys = nearbyDeliveryBoys.filter(
                (b) => !busyIdSet.has(String(b._id))
            );
            deliveryBoyPayload = availableBoys.map((b) => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile,
            }));
            if (availableBoys.length === 0) {
                await order.save();
                return res.status(200).json({
                    success: true,
                    message:
                        "Order status updated but no delivery boys are available.",
                    shopOrder,
                    assignDeliveryBoy: null,
                    assignment: null,
                    availableBoys: [],
                });
            }
            const assignment = await DeliverAssignment.create({
                order: orderId,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                broadcastedTo: availableBoys.map((b) => b._id),
                status: "broadcasted",
            });
            shopOrder.assignment = assignment._id;
            shopOrder.assignDeliveryBoy = null;
        }

        await order.save();
        await order.populate("shopOrders.shop", "name");
        await order.populate("shopOrders.assignDeliveryBoy", "fullName");

        const updatedShopOrder = order.shopOrders.find(
            (o) => (o.shop._id || o.shop).toString() === shopId
        );
        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            shopOrder: updatedShopOrder,
            assignDeliveryBoy: updatedShopOrder.assignDeliveryBoy,
            assignment: updatedShopOrder.assignment,
            availableBoys: deliveryBoyPayload,
        });

    } catch (error) {
        console.error("Update Order Status Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await DeliverAssignment.findById(assignmentId)
            .populate("broadcastedTo", "fullName mobile location")
            .populate("assignedTo", "fullName mobile location");

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        return res.status(200).json({
            success: true,
            assignment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};