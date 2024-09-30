import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface AppState {
    loading: boolean;
    title: string;
    error: string;
    message: string;
}

const initialState: AppState = {
    loading: false,
    title: '',
    error: '',
    message: '',
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAppTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload;
        },
        setAppError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setAppMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
    },
});

export const {
    setAppLoading,
    setAppTitle,
    setAppError,
    setAppMessage,
} = appSlice.actions;

export default appSlice.reducer;
