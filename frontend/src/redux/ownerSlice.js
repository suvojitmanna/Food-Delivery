import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: "owner",

    initialState: {
        myShop: null,
        loading: true,
    },

    reducers: {
        setMyShop: (state, action) => {
            state.myShop = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setMyShop,
    setLoading,
} = ownerSlice.actions;

export default ownerSlice.reducer;