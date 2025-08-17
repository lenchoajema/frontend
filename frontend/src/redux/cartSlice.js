import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Fetch cart items
export const fetchCart = createAsyncThunk("user/cart/fetchCart", async (_, thunkAPI) => {
  try {
    const response = await api.get("/user/cart");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

// Add item to cart
export const addToCart = createAsyncThunk("/user/cart/addToCart", async ({ productId, quantity }, thunkAPI) => {
  try {
<<<<<<< HEAD:frontend/src/redux/cartSlice.js
    // Call backend route mounted at /api/user/cart (api.baseURL already includes /api)
    const response = await api.post('/user/cart', { productId, quantity });

    // Backend returns { message, cart } or just cart
    const cart = response.data?.cart || response.data;

    // Normalize backend cart items into the shape the reducers expect:
    // reducer expects items like { product: { _id, price, name, pictures }, quantity }
=======
    //console.log("before add to cart", productId, quantity);
    const response = await api.post('/user/cart', { productId, quantity });

    const cart = response.data?.cart || response.data;

>>>>>>> 4741d68254aaf2626ca331a2b8e1f40d763f1a28:src/redux/cartSlice.js
    const items = (cart.items || []).map((it) => ({
      product: {
        _id: it.productId || (it.product && it.product._id),
        price: it.price || (it.product && it.product.price),
        name: it.name || (it.product && it.product.name),
        pictures: it.pictures || (it.product && it.product.pictures) || [],
      },
      quantity: it.quantity,
    }));

    return {
      items,
      totalPrice: cart.total ?? cart.totalPrice ?? 0,
    };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
  }
});

// Remove item from cart
export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (id, thunkAPI) => {
  try {
    await api.delete(`/user/cart/${id}`);
    return id;  // Return the ID of the removed item
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

// Update item quantity in cart
export const updateQuantity = createAsyncThunk("cart/updateQuantity", async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await api.patch(`/user/cart/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;  // Ensure your response returns `items`
        console.log("fetch cart", action.payload);
        state.total = action.payload.totalPrice;  // Ensure your response returns `totalPrice`
        console.log("fetch cart", action.payload.totalPrice);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add item to cart
      .addCase(addToCart.fulfilled, (state, action) => {
        const items = action.payload.items || []; // Ensure items is always an array
        console.log("add to cart", items);
        if (items.length === 0) {
          console.warn("No items in payload to add to cart.");
          console.log("add to cart", items);
          return; // Exit early if no items are provided
        }
      
        const item = items[0]; // Safely access the first item
        console.log("add to cart", item); 
        const existingItem = state.items.find((i) => i.product._id === item.product._id);
      
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          state.items.push(item);
        }

        state.total = state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
        console.log("add to cart", state.items);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove item from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.product._id !== action.payload);
        state.total = state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
        console.log("remove from cart", state.items, state.total);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const index = state.items.findIndex(
          (item) => item.product._id === updatedItem.product._id
        );
        if (index !== -1) {
          state.items[index].quantity = updatedItem.quantity;
        }
        state.total = state.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      });
  },
});

export default cartSlice.reducer;
