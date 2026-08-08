import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    carts: {},
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const payload = action.payload;

            const item = payload.item || payload;
            const shop = payload.shop || item.shop;

            if (!shop) {
                console.error("addToCart: shop is missing", payload);
                return;
            }

            const shopId = typeof shop === "object" ? shop._id : shop;

            if (!state.carts[shopId]) {
                state.carts[shopId] = {
                    shop,
                    items: {},
                };
            }

            const shopCart = state.carts[shopId];

            if (shopCart.items[item._id]) {
                shopCart.items[item._id].quantity += 1;
            } else {
                shopCart.items[item._id] = {
                    ...item,
                    quantity: item.quantity || 1,
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