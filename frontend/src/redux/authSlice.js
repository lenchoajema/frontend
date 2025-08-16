import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Stores detailed user information (username, role, etc.)
  token: null, // JWT token
  isAuthenticated: false, // Tracks authentication status
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { user, token } = action.payload;
      state.user = user; // Store the full user object (e.g., { username, role, email, etc. })
      state.token = token; // Store the JWT token
      state.isAuthenticated = true; // Mark as authenticated
    },
    setUser(state, action) {
      const { user, token } = action.payload;
      state.user = user || state.user; // Update or retain existing user data
      state.token = token || state.token; // Update or retain existing token
      state.isAuthenticated = Boolean(user); // Ensure authentication status is in sync
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
