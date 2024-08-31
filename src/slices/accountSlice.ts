import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface AccountState {
    authorized: boolean;
    admin: boolean;
    fullname: string;
}

const initialState: AccountState = {
    authorized: false,
    admin: false,
    fullname: "",
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setAccountAuthorized: (state, action: PayloadAction<boolean>) => {
            state.authorized = action.payload;
        },
        setAccountAdmin: (state, action: PayloadAction<boolean>) => {
            state.admin = action.payload;
        },
        setAccountFullname: (state, action: PayloadAction<string>) => {
            state.fullname = action.payload;
        }
    },
});

export const {
    setAccountAuthorized,
    setAccountAdmin,
    setAccountFullname,
} = accountSlice.actions;

export default accountSlice.reducer;
