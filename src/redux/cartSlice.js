import { createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], total: 0 },
  reducers: {
    setCart(state, action) {
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    addItem(state, action) {
      state.items.push(action.payload);
      state.total += action.payload.price * action.payload.quantity;
    },
    updateItem(state, action) {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index >= 0) {
        const oldQuantity = state.items[index].quantity;
        state.items[index] = action.payload;
        state.total +=
          action.payload.quantity * action.payload.price -
          oldQuantity * action.payload.price;
      }
    },
    removeItem(state, action) {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index >= 0) {
        state.total -= state.items[index].quantity * state.items[index].price;
        state.items.splice(index, 1);
      }
    },
  },
});

export const { setCart, addItem, updateItem, removeItem } = cartSlice.actions;

export const fetchCart = () => async (dispatch) => {
  try {
    const response = await api.get("/cart");
    dispatch(setCart(response.data));
  } catch (error) {
    console.error("Failed to fetch cart:", error);
  }
};

export const addToCart = (item) => async (dispatch) => {
  try {
    const response = await api.post("/cart", item);
    dispatch(addItem(response.data));
  } catch (error) {
    console.error("Failed to add item to cart:", error);
  }
};

export const updateCartItem = (id, quantity) => async (dispatch) => {
  try {
    const response = await api.put(`/cart/${id}`, { quantity });
    dispatch(updateItem(response.data));
  } catch (error) {
    console.error("Failed to update cart item:", error);
  }
};

export const removeFromCart = (id) => async (dispatch) => {
  try {
    await api.delete(`/cart/${id}`);
    dispatch(removeItem({ _id: id }));
  } catch (error) {
    console.error("Failed to remove cart item:", error);
  }
};

export default cartSlice.reducer;
