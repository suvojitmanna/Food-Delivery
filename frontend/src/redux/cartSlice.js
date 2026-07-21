import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    carts: {},
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const shopId = item.shop._id;

            // Create shop cart if it doesn't exist
            if (!state.carts[shopId]) {
                state.carts[shopId] = {
                    shop: item.shop,
                    items: {},
                };
            }

            const shopCart = state.carts[shopId];

            if (shopCart.items[item._id]) {
                shopCart.items[item._id].quantity += 1;
            } else {
                shopCart.items[item._id] = {
                    ...item,
                    quantity: 1,
                };
            }
        },

        removeFromCart: (state, action) => {
            const { shopId, itemId } = action.payload;

            if (!state.carts[shopId]) return;

            const shopCart = state.carts[shopId];

            if (!shopCart.items[itemId]) return;

            if (shopCart.items[itemId].quantity > 1) {
                shopCart.items[itemId].quantity -= 1;
            } else {
                delete shopCart.items[itemId];
            }

            // Remove shop cart if empty
            if (Object.keys(shopCart.items).length === 0) {
                delete state.carts[shopId];
            }
        },

        clearShopCart: (state, action) => {
            delete state.carts[action.payload];
        },

        clearAllCart: (state) => {
            state.carts = {};
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    clearShopCart,
    clearAllCart,
} = cartSlice.actions;

export default cartSlice.reducer;