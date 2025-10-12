import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
	const { data } = await api.get('/user/cart');
	return data || { items: [], total: 0 };
});

export const addToCart = createAsyncThunk('cart/add', async (payload) => {
	// payload: { productId, quantity }
	const { data } = await api.post('/user/cart', payload);
	return data.cart || { items: [], total: 0 };
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }) => {
	const { data } = await api.put(`/user/cart/${productId}`, { quantity });
	return data.cart || { items: [], total: 0 };
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId) => {
	const { data } = await api.delete(`/user/cart/${productId}`);
	return data.cart || { items: [], total: 0 };
});

const initialState = { items: [], total: 0, status: 'idle', error: null };

const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		clearCart(state) { state.items = []; state.total = 0; },
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCart.pending, (state) => { state.status = 'loading'; })
			.addCase(fetchCart.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.items = action.payload.items || [];
				state.total = action.payload.total || 0;
			})
			.addCase(fetchCart.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })

			.addCase(addToCart.fulfilled, (state, action) => {
				state.items = action.payload.items || [];
				state.total = action.payload.total || 0;
			})
			.addCase(updateCartItem.fulfilled, (state, action) => {
				state.items = action.payload.items || [];
				state.total = action.payload.total || 0;
			})
			.addCase(removeFromCart.fulfilled, (state, action) => {
				state.items = action.payload.items || [];
				state.total = action.payload.total || 0;
			});
	}
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
