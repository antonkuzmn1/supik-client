import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface AccountState {
    authorized: boolean;
    admin: boolean;
}

const initialState: AccountState = {
    authorized: false,
    admin: false,
}

const userSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setAccountAuthorized: (state, action: PayloadAction<boolean>) => {
            state.authorized = action.payload;
        },
        setAccountAdmin: (state, action: PayloadAction<boolean>) => {
            state.admin = action.payload;
        },
    },
});

export const {
    setAccountAuthorized,
    setAccountAdmin,
} = userSlice.actions;

export default userSlice.reducer;
