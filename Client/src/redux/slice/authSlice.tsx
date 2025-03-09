import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface AuthSliceState  {
    isLoggedIn: boolean;
    token: string;
    role: string;
}

const initialState: AuthSliceState = {
    isLoggedIn: !!localStorage.getItem('accessToken'),
    token: localStorage.getItem('accessToken') || '',
    role: localStorage.getItem('role') || '',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{token: any, role: any}> ) => {
            localStorage.setItem('accessToken', action.payload.token);
            localStorage.setItem('role', action.payload.role);
            state.isLoggedIn = true;
            state.token = action.payload.token;
            state.role = action.payload.role;
        },

        logOut: (state) => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('role')
            state.isLoggedIn = false,
            state.token = '';
            state.role = '';
        }
    }
})

export const {loginSuccess, logOut} = authSlice.actions;
export default authSlice.reducer; 