import { createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

const orderSlice = createSlice({
  name: "orders",
  initialState: { list: [] },
  reducers: {
    setOrders(state, action) {
      state.list = action.payload;
    },
  },
});

export const { setOrders } = orderSlice.actions;

export const fetchOrders = () => async (dispatch) => {
  try {
    const response = await api.get("/orders");
    dispatch(setOrders(response.data));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};

export default orderSlice.reducer;
