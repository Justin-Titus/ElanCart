import { createSlice } from '@reduxjs/toolkit';
import { logout } from './userSlice';

const initialState = {
  items: []
};

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addToFavourites: (state, action) => {
      if (!state.items.some(item => item.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    removeFromFavourites: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleFavourite: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex(item => item.id === product.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
    },
    clearFavourites: (state) => {
      state.items = [];
    },
    loadFavourites: (state, action) => {
      return action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = [];
    });
  }
});

export const {
  addToFavourites,
  removeFromFavourites,
  toggleFavourite,
  clearFavourites,
  loadFavourites
} = favouritesSlice.actions;

// Selectors
export const selectFavouritesState = (state) => state.favourites;
export const selectFavourites = (state) => state.favourites.items;
export const selectFavouritesCount = (state) => state.favourites.items.length;
export const selectIsFavourite = (productId) => (state) =>
  state.favourites.items.some(item => item.id === productId);

export default favouritesSlice.reducer;
