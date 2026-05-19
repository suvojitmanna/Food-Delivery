import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        loading: true,
        city: null
    },

    reducers: {

        setUserData: (state, action) => {
            state.userData = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCity: (state, action) => {
            state.city = action.payload
        }
    }
});

export const { setUserData, setLoading, setCity } = userSlice.actions;

export default userSlice.reducer;