import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiverName: {
            type: String,
            required: true,
            trim: true,
        },

        flatNo: {
            type: String,
            required: true,
            trim: true,
        },

        streetArea: {
            type: String,
            required: true,
        },

        landmark: {
            type: String,
            default: "",
        },

        buildingName: {
            type: String,
            default: "",
        },

        areaName: {
            type: String,
            default: "",
        },

        mobileNumber: {
            type: Number,
            required: true,
        },

        addressType: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
        },

        latitude: {
            type: Number,
            required: true,
        },

        longitude: {
            type: Number,
            required: true,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "DeliveryAddress",
    deliveryAddressSchema
);