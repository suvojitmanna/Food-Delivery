import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
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

        description: {
            type: String,
            trim: true,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        originalPrice: {
            type: Number,
            default: 0,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Pizza",
                "Burger",
                "Biryani",
                "Drinks",
                "Dessert",
                "Chinese",
                "Indian",
                "South Indian",
                "Fast Food",
                "Snacks",

                // --- Newly Added Delicious Options ---
                "Pasta",
                "Noodles",
                "Rolls & Wraps",
                "Sandwich",
                "Momos",
                "Shawarma",
                "Kebabs",
                "Chaats",
                "Thali",
                "Salad",
                "Healthy Food",
                "Waffles",
                "Cakes & Pastries",
                "Ice Cream",
                "Shakes & Smoothies",
                "Mexican",
                "Italian"
            ]
        },

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },
        type: {
            type: String,
            enum: ["Veg", "Non-Veg"],
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
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

        preparationTime: {
            type: Number,
            default: 15,
        },
    },
    {
        timestamps: true,
    }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;