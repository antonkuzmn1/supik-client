import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface AppState {
    loading: boolean;
}

const initialState: AppState = {
    loading: false,
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        }
    },
});

export const {
    setAppLoading,
} = appSlice.actions;

export default appSlice.reducer;
