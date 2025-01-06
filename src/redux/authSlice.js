import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null }, // Initial state with `user` and `token`
  reducers: {
    login(state, action) {
      state.user = action.payload.user; // Store user details
      state.token = action.payload.token; // Store token
    },
    logout(state) {
      state.user = null; // Clear user on logout
      state.token = null; // Clear token on logout
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
