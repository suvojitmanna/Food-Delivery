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
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },

        // ================= LOADERS =================

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

        // ================= DATA =================

        setCity: (state, action) => {
            state.city = action.payload;
        },

        setShopInMyCity: (state, action) => {
            state.shopInMyCity = action.payload;
        },

        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload;
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
} = userSlice.actions;

export default userSlice.reducer;