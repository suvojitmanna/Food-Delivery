import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        deliveryTime: {
            type: Number,
            default: 30,
        },

        deliveryFee: {
            type: Number,
            default: 0,
        },

        isOpen: {
            type: Boolean,
            default: true,
        },

        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
            },
        ],

        categories: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;