import mongoose from "mongoose";

const deliverAssignmentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        shopOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        broadcastedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        status: {
            type: String,
            enum: ["broadcasted", "assigned", "expired"],
            default: "broadcasted",
        },

        acceptedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const DeliverAssignment = mongoose.model("DeliverAssignment", deliverAssignmentSchema
);

export default DeliverAssignment;