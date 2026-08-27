import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import favouritesReducer from './slices/favouritesSlice';
import userReducer from './slices/userSlice';
import productsReducer from './slices/productsSlice';
import localeReducer from './slices/localeSlice';
import { persistenceMiddleware, readStorage, STORAGE_KEYS } from './persistenceMiddleware';

// Rehydrate persisted state from localStorage (mirrors previous Context behavior)
const preloadedState = {};

// Dedupe cart items by id and recompute total, guarding against stale/corrupt storage
const sanitizeCart = (cart) => {
  if (!cart || !Array.isArray(cart.items)) return null;
  const byId = new Map();
  for (const item of cart.items) {
    if (!item || item.id == null) continue;
    const qty = Number(item.quantity) || 1;
    if (byId.has(item.id)) {
      byId.get(item.id).quantity += qty;
    } else {
      byId.set(item.id, { ...item, quantity: qty });
    }
  }
  const items = [...byId.values()];
  const total = parseFloat(
    items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0).toFixed(2)
  );
  return { items, total };
};

const savedCart = sanitizeCart(readStorage(STORAGE_KEYS.CART_KEY));
if (savedCart) {
  preloadedState.cart = savedCart;
}

const savedFavourites = readStorage(STORAGE_KEYS.FAVOURITES_KEY);
if (savedFavourites && Array.isArray(savedFavourites.items)) {
  // Dedupe by id
  const seen = new Set();
  const items = savedFavourites.items.filter((item) => {
    if (!item || item.id == null || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  preloadedState.favourites = { items };
}

const savedUser = readStorage(STORAGE_KEYS.USER_KEY);
preloadedState.user = { user: savedUser || null, loading: false };

const savedLocale = readStorage(STORAGE_KEYS.LOCALE_KEY);
if (savedLocale && typeof savedLocale === 'object') {
  preloadedState.locale = {
    lang: savedLocale.lang || 'en',
    currency: savedLocale.currency || 'INR'
  };
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    favourites: favouritesReducer,
    user: userReducer,
    products: productsReducer,
    locale: localeReducer
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware)
});

export default store;