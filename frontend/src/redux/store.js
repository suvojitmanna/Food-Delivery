import { configureStore } from '@reduxjs/toolkit';
import userSlice from "./userSlice"
import ownerslice from "./ownerSlice"

export const store = configureStore({
    reducer: {
        user: userSlice,
        owner:ownerslice
    }
})