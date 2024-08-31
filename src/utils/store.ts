import {configureStore} from "@reduxjs/toolkit";
import deviceReducer from './../slices/deviceSlice';
import accountSlice from './../slices/accountSlice';
import appSlice from './../slices/appSlice';

export const store = configureStore({
    reducer: {
        device: deviceReducer,
        account: accountSlice,
        app: appSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
