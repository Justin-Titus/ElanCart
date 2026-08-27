import { createSlice } from '@reduxjs/toolkit';
import { logout } from './userSlice';

const computeTotal = (items) =>
  parseFloat(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

const initialState = {
  items: [],
  total: 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const quantity = product.quantity || 1;
      const existing = state.items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity });
      }
      state.total = computeTotal(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = computeTotal(state.items);
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id);
      } else {
        const item = state.items.find(item => item.id === id);
        if (item) item.quantity = quantity;
      }
      state.total = computeTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    loadCart: (state, action) => {
      return action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = [];
      state.total = 0;
    });
  }
});

export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart, loadCart } = cartSlice.actions;

// Selectors
export const selectCartState = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectIsInCart = (productId) => (state) =>
  state.cart.items.some(item => item.id === productId);
export const selectCartItem = (productId) => (state) =>
  state.cart.items.find(item => item.id === productId);

export default cartSlice.reducer;
