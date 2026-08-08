import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import DeliveryAddress from "../models/address.model.js";
import DeliverAssignment from "../models/deliveryAssignment.model.js";
import mongoose from "mongoose";

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
                .populate("shopOrders.owner", "fullName email mobile profilePic")
                .populate("shopOrders.assignDeliveryBoy", "fullName email mobile ")
                .populate("user", "fullName email mobile profilePic")
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

export const getDeliveryAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;
        const assignments = await DeliverAssignment.find({
            broadcastedTo: deliveryBoyId,
            status: "broadcasted",
        })
            .populate({
                path: "order",
                populate: {
                    path: "deliveryAddress",
                },
            })
            .populate("shop");

        const formatted = assignments.map((a) => {
            const shopOrder = a.order?.shopOrders?.find(
                (so) => so._id.toString() === a.shopOrderId.toString()
            );

            return {
                assignmentId: a._id,
                orderId: a.order?._id,

                shopName: a.shop?.name,
                shopLocation: a.shop?.location,
                shopAddress: a.shop?.address,

                deliveryAddress: {
                    receiverName: a.order?.deliveryAddress?.receiverName,
                    mobileNumber: a.order?.deliveryAddress?.mobileNumber,
                    latitude: a.order?.deliveryAddress?.latitude,
                    longitude: a.order?.deliveryAddress?.longitude,
                    city: a.order?.deliveryAddress?.city,
                    streetArea: a.order?.deliveryAddress?.streetArea,
                    landmark: a.order?.deliveryAddress?.landmark,
                },

                items: shopOrder?.items || [],
                subtotal: shopOrder?.subtotal || 0,
                status: shopOrder?.status,
            };
        });

        return res.status(200).json({
            success: true,
            assignments: formatted,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get assignment error: ${error.message}`,
        });
    }
};

export const acceptOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { assignmentId } = req.params;
        const assignment = await DeliverAssignment.findById(assignmentId).session(session);
        if (!assignment) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }
        if (assignment.status !== "broadcasted") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Assignment has already been accepted or expired",
            });
        }
        const alreadyAssigned = await DeliverAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned",
        }).session(session);

        if (alreadyAssigned) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "You are already assigned to another order",
            });
        }

        const order = await Order.findById(assignment.order).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const shopOrder = order.shopOrders.find(
            (so) => so._id.toString() === assignment.shopOrderId.toString()
        );
        if (!shopOrder) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Shop order not found",
            });
        }
        if (shopOrder.assignDeliveryBoy) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Order already accepted",
            });
        }
        assignment.assignedTo = req.userId;
        assignment.status = "assigned";
        assignment.acceptedAt = new Date();

        await assignment.save({ session });
        shopOrder.assignDeliveryBoy = req.userId;
        shopOrder.status = "out for delivery";

        await order.save({ session });
        await DeliverAssignment.updateMany(
            {
                order: assignment.order,
                shopOrderId: assignment.shopOrderId,
                _id: { $ne: assignment._id },
                status: "broadcasted",
            },
            {
                $set: {
                    status: "cancelled",
                },
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Order accepted successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliverAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned",
        })
            .populate("shop", "name image location")
            .populate(
                "assignedTo",
                "fullName email mobile profilePic location"
            )
            .populate({
                path: "order",
                populate: [
                    {
                        path: "user",
                        select: "fullName email mobile location",
                    },
                    {
                        path: "deliveryAddress",
                    },
                    {
                        path: "shopOrders.owner",
                        select: "fullName email mobile profilePic",
                    },
                ],
            });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        if (!assignment.order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const shopOrder = assignment.order.shopOrders.find(
            (so) => so._id.toString() === assignment.shopOrderId.toString()
        );

        if (!shopOrder) {
            return res.status(404).json({
                success: false,
                message: "Shop order not found",
            });
        }

        const deliveryBoyLocation = { lat: null, lon: null, };

        if (
            assignment.assignedTo?.location?.coordinates?.length === 2
        ) {
            deliveryBoyLocation.lat =
                assignment.assignedTo.location.coordinates[1];
            deliveryBoyLocation.lon =
                assignment.assignedTo.location.coordinates[0];
        }

        const customerLocation = {
            lat: assignment.order.deliveryAddress?.latitude ?? null,
            lon: assignment.order.deliveryAddress?.longitude ?? null,
        };

        return res.status(200).json({
            success: true,
            orderId: assignment.order._id,
            user: assignment.order.user,
            shopMobile: shopOrder.owner?.mobile,
            shopOwner: shopOrder.owner,
            deliveryBoy: assignment.assignedTo,
            shop: assignment.shop,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("user")
            .populate("deliveryAddress")
            .populate({
                path: "shopOrders.shop",
                model: "Shop",
            })
            .populate({
                path: "shopOrders.assignDeliveryBoy",
                model: "User",
            })
            .populate({
                path: "shopOrders.owner",
                model: "User",
                select: "fullName email mobile profilePic",
            })
            .populate({
                path: "shopOrders.items",
                model: "Item",
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.error(
            "Get Order By Id Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: `Get Order By Id Error: ${error.message}`,
        });
    }
};