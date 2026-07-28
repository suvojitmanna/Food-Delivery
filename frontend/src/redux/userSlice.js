import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,

        userLoading: false,
        cityLoading: false,
        shopLoading: false,
        itemLoading: false,

        city: null,
        shopInMyCity: null,
        itemsInMyCity: null,
        myOrders: []
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },

        // LOADERS
        setUserLoading: (state, action) => {
            state.userLoading = action.payload;
        },

        setCityLoading: (state, action) => {
            state.cityLoading = action.payload;
        },

        setShopLoading: (state, action) => {
            state.shopLoading = action.payload;
        },

        setItemLoading: (state, action) => {
            state.itemLoading = action.payload;
        },

        // DATA
        setCity: (state, action) => {
            state.city = action.payload;
        },

        setShopInMyCity: (state, action) => {
            state.shopInMyCity = action.payload;
        },

        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload;
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
        },
        addMyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders]
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(
                (o) => o._id === orderId
            );

            if (order) {
                const shopOrder = order.shopOrders.find(
                    (s) => s.shop._id === shopId
                );

                if (shopOrder) {
                    shopOrder.status = status;
                }
            }
        },
    },
});

export const {
    setUserData,

    setUserLoading,
    setCityLoading,
    setShopLoading,
    setItemLoading,

    setCity,
    setShopInMyCity,
    setItemsInMyCity,
    setMyOrders,
    addMyOrder,
    updateOrderStatus
} = userSlice.actions;

export default userSlice.reducer;