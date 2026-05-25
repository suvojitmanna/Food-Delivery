import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import ownerslice from "./ownerSlice";

import storage from "redux-persist/lib/storage";

import {
  persistStore,
  persistReducer,
} from "redux-persist";

console.log(storage);

const persistConfig = {
  key: "root",
  storage: storage.default || storage,
};

const persistedUserReducer = persistReducer(
  persistConfig,
  userSlice
);

const persistedOwnerReducer = persistReducer(
  persistConfig,
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