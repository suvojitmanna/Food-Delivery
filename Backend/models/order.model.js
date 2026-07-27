import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        name: String,
        image: String,
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const shopOrderSchema = new mongoose.Schema(
    {
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "preparing",
                "ready",
                "picked",
                "out for delivery",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        items: [shopOrderItemSchema],
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliverAssignment",
            default:null
        },
        assignDeliveryBoy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps: true }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        deliveryAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryAddress",
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        shopOrders: [shopOrderSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);