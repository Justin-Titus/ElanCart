/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

// Cart action types - exported for potential use in other files
export const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM_QUANTITY: 'UPDATE_CART_ITEM_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  CALCULATE_TOTAL_VALUE: 'CALCULATE_TOTAL_VALUE',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
        };
      }
      break;
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART:
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
      break;
    
    case CART_ACTIONS.UPDATE_CART_ITEM_QUANTITY: {
      if (action.payload.quantity <= 0) {
        newState = {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      } else {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        };
      }
      break;
    }
    
    case CART_ACTIONS.CLEAR_CART:
      newState = {
        ...state,
        items: []
      };
      break;
    
    case CART_ACTIONS.LOAD_CART:
      return action.payload;
    
    default:
      return state;
  }
  
  // Auto-calculate total for all mutations
  if (newState) {
    const total = newState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    newState.total = parseFloat(total.toFixed(2));
    return newState;
  }
  
  return state;
};

// Initial cart state
const initialCartState = {
  items: [],
  total: 0
};

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change (debounced with requestIdleCallback)
  useEffect(() => {
    const saveToStorage = () => {
      localStorage.setItem('ecommerce-cart', JSON.stringify(cartState));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(saveToStorage);
    } else {
      setTimeout(saveToStorage, 0);
    }
  }, [cartState]);

  // Clear cart when a global logout event is dispatched
  useEffect(() => {
    const onLogout = () => {
      // Clear state and remove persisted storage
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      try {
        localStorage.removeItem('ecommerce-cart');
      } catch {
        // ignore
      }
    };

    window.addEventListener('ecommerce:logout', onLogout);
    return () => window.removeEventListener('ecommerce:logout', onLogout);
  }, []);

  // Calculate total whenever items change (optimized - done in reducer instead)
  // Removed separate useEffect for total calculation

  // Cart actions
  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { ...product, quantity }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { id: productId }
    });
  }, []);

  const updateCartItemQuantity = useCallback((productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_CART_ITEM_QUANTITY,
      payload: { id: productId, quantity }
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  }, []);

  const getCartItemCount = useCallback(() => {
    return cartState.items.reduce((count, item) => count + item.quantity, 0);
  }, [cartState.items]);

  const isInCart = useCallback((productId) => {
    return cartState.items.some(item => item.id === productId);
  }, [cartState.items]);

  const getCartItem = useCallback((productId) => {
    return cartState.items.find(item => item.id === productId);
  }, [cartState.items]);

  const value = useMemo(() => ({
    cartState,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartItemCount,
    isInCart,
    getCartItem
  }), [cartState, addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartItemCount, isInCart, getCartItem]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

CartProvider.displayName = 'CartProvider';