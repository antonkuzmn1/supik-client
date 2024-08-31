import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface AppState {
    loading: boolean;
    title: string;
}

const initialState: AppState = {
    loading: false,
    title: '',
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
        }
    },
});

export const {
    setAppLoading,
    setAppTitle,
} = appSlice.actions;

export default appSlice.reducer;
