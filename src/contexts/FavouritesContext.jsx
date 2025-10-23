/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

const FavouritesContext = createContext();

// Favourites action types
export const FAVOURITES_ACTIONS = {
  ADD_TO_FAVOURITES: 'ADD_TO_FAVOURITES',
  REMOVE_FROM_FAVOURITES: 'REMOVE_FROM_FAVOURITES',
  CLEAR_FAVOURITES: 'CLEAR_FAVOURITES',
  LOAD_FAVOURITES: 'LOAD_FAVOURITES'
};

// Favourites reducer
const favouritesReducer = (state, action) => {
  switch (action.type) {
    case FAVOURITES_ACTIONS.ADD_TO_FAVOURITES:
      // Check if item already exists
      if (state.items.some(item => item.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    
    case FAVOURITES_ACTIONS.REMOVE_FROM_FAVOURITES:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    
    case FAVOURITES_ACTIONS.CLEAR_FAVOURITES:
      return {
        ...state,
        items: []
      };
    
    case FAVOURITES_ACTIONS.LOAD_FAVOURITES:
      return action.payload;
    
    default:
      return state;
  }
};

// Initial favourites state
const initialFavouritesState = {
  items: []
};

export const FavouritesProvider = ({ children }) => {
  const [favouritesState, dispatch] = useReducer(favouritesReducer, initialFavouritesState);

  // Load favourites from localStorage on mount
  useEffect(() => {
    const savedFavourites = localStorage.getItem('ecommerce-favourites');
    if (savedFavourites) {
      try {
        const parsedFavourites = JSON.parse(savedFavourites);
        dispatch({ type: FAVOURITES_ACTIONS.LOAD_FAVOURITES, payload: parsedFavourites });
      } catch (error) {
        console.error('Error loading favourites from localStorage:', error);
      }
    }
  }, []);

  // Save favourites to localStorage whenever favourites change (debounced)
  useEffect(() => {
    const saveToStorage = () => {
      localStorage.setItem('ecommerce-favourites', JSON.stringify(favouritesState));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(saveToStorage);
    } else {
      setTimeout(saveToStorage, 0);
    }
  }, [favouritesState]);

  // Clear favourites when a global logout event is dispatched
  useEffect(() => {
    const onLogout = () => {
      dispatch({ type: FAVOURITES_ACTIONS.CLEAR_FAVOURITES });
      try {
        localStorage.removeItem('ecommerce-favourites');
      } catch {
        // ignore
      }
    };

    window.addEventListener('ecommerce:logout', onLogout);
    return () => window.removeEventListener('ecommerce:logout', onLogout);
  }, []);

  // Favourites actions
  const addToFavourites = useCallback((product) => {
    dispatch({
      type: FAVOURITES_ACTIONS.ADD_TO_FAVOURITES,
      payload: product
    });
  }, []);

  const removeFromFavourites = useCallback((productId) => {
    dispatch({
      type: FAVOURITES_ACTIONS.REMOVE_FROM_FAVOURITES,
      payload: { id: productId }
    });
  }, []);

  const toggleFavourite = useCallback((product) => {
    const isFav = favouritesState.items.some(item => item.id === product.id);
    if (isFav) {
      removeFromFavourites(product.id);
    } else {
      addToFavourites(product);
    }
  }, [favouritesState.items, addToFavourites, removeFromFavourites]);

  const clearFavourites = useCallback(() => {
    dispatch({ type: FAVOURITES_ACTIONS.CLEAR_FAVOURITES });
  }, []);

  const getFavouritesCount = useCallback(() => {
    return favouritesState.items.length;
  }, [favouritesState.items]);

  const isFavourite = useCallback((productId) => {
    return favouritesState.items.some(item => item.id === productId);
  }, [favouritesState.items]);

  const value = useMemo(() => ({
    favouritesState,
    addToFavourites,
    removeFromFavourites,
    toggleFavourite,
    clearFavourites,
    getFavouritesCount,
    isFavourite
  }), [favouritesState, addToFavourites, removeFromFavourites, toggleFavourite, clearFavourites, getFavouritesCount, isFavourite]);

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

// Custom hook to use favourites context
export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}

FavouritesProvider.displayName = 'FavouritesProvider';
