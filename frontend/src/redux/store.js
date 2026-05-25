import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import ownerslice from "./ownerSlice";

import storage from "redux-persist/lib/storage";

import {
    persistReducer,
    persistStore,
} from "redux-persist";

const userPersistConfig = {
    key: "user",
    storage: storage.default,
};

const ownerPersistConfig = {
    key: "owner",
    storage: storage.default,
};

const persistedUserReducer = persistReducer(
    userPersistConfig,
    userSlice
);

const persistedOwnerReducer = persistReducer(
    ownerPersistConfig,
    ownerslice
);

export const store = configureStore({
    reducer: {
        user: persistedUserReducer,
        owner: persistedOwnerReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);