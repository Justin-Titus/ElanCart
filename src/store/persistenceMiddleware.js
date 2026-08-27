// Persistence middleware: mirrors the previous Context providers' localStorage behavior.
// - cart        -> 'ecommerce-cart'
// - favourites  -> 'ecommerce-favourites'
// - user        -> 'ecommerce-user'
// - locale      -> 'ecommerce-locale'
// Writes are deferred with requestIdleCallback (or setTimeout fallback).
// On user logout, cart and favourites storage entries are removed.

const CART_KEY = 'ecommerce-cart';
const FAVOURITES_KEY = 'ecommerce-favourites';
const USER_KEY = 'ecommerce-user';
const LOCALE_KEY = 'ecommerce-locale';

const scheduleWrite = (fn) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(fn);
  } else {
    setTimeout(fn, 0);
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
};

export const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof action !== 'object' || !action?.type) return result;
  const [slice] = action.type.split('/');
  const state = store.getState();

  switch (slice) {
    case 'cart':
      scheduleWrite(() => write(CART_KEY, state.cart));
      break;
    case 'favourites':
      scheduleWrite(() => write(FAVOURITES_KEY, state.favourites));
      break;
    case 'locale':
      scheduleWrite(() => write(LOCALE_KEY, state.locale));
      break;
    case 'user':
      if (action.type === 'user/logout') {
        remove(USER_KEY);
        remove(CART_KEY);
        remove(FAVOURITES_KEY);
      } else {
        scheduleWrite(() => write(USER_KEY, state.user.user));
      }
      break;
    default:
      break;
  }

  return result;
};

// Safe JSON read helper used by store preloadedState
export const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const STORAGE_KEYS = { CART_KEY, FAVOURITES_KEY, USER_KEY, LOCALE_KEY };

export default persistenceMiddleware;