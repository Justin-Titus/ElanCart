/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const ProductContext = createContext();

// Product action types - exported for potential use in other files
export const PRODUCT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  LOAD_CACHED_DATA: 'LOAD_CACHED_DATA'
};

// Product reducer
const productReducer = (state, action) => {
  switch (action.type) {
    case PRODUCT_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case PRODUCT_ACTIONS.SET_PRODUCTS:
      return { ...state, products: action.payload, loading: false, error: null };
    
    case PRODUCT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case PRODUCT_ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload }, currentPage: 1 };
    
    case PRODUCT_ACTIONS.SET_SORT:
      return { ...state, sortBy: action.payload, currentPage: 1 };
    
    case PRODUCT_ACTIONS.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    
    case PRODUCT_ACTIONS.LOAD_CACHED_DATA:
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  products: [],
  loading: true,
  error: null,
  filters: {
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    searchTerm: ''
  },
  sortBy: 'name-asc',
  currentPage: 1,
  itemsPerPage: 12
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  const fetchProducts = useCallback(async () => {
    dispatch({ type: PRODUCT_ACTIONS.SET_LOADING, payload: true });

    try {
      // Fetch products from dummyjson only (limit 100 as requested)
      const sources = [
        axios.get('https://dummyjson.com/products?limit=100')
      ];

      const results = await Promise.allSettled(sources);

      let combined = [];

      // Process dummyjson results (object with .products)
      if (results[0]?.status === 'fulfilled') {
        const djData = results[0].value.data?.products || [];
        const mappedDj = djData.map(p => ({
          id: `dj-${p.id}`,
          title: p.title,
          description: p.description,
          price: Number(p.price) || 0,
          // normalize category strings to avoid accidental whitespace/case mismatches
          category: String(p.category || 'uncategorized').trim(),
          image: p.thumbnail || (p.images && p.images[0]) || '',
          images: p.images || (p.thumbnail ? [p.thumbnail] : []),
          rating: p.rating || 0,
          ratingCount: p.stock || 0,
          stock: p.stock ?? Math.floor(Math.random() * 50) + 10
        }));
        combined = combined.concat(mappedDj);
      }

      // Fallback to dummyjson again if initial request failed
      if (combined.length === 0) {
        const response = await axios.get('https://dummyjson.com/products?limit=100');
        const djData = response.data?.products || [];
        combined = djData.map(p => ({
          id: `dj-${p.id}`,
          title: p.title,
          description: p.description,
          price: Number(p.price) || 0,
          category: String(p.category || 'uncategorized').trim(),
          image: p.thumbnail || (p.images && p.images[0]) || '',
          images: p.images || (p.thumbnail ? [p.thumbnail] : []),
          rating: p.rating || 0,
          ratingCount: p.stock || 0,
          stock: p.stock ?? Math.floor(Math.random() * 50) + 10
        }));
      }

      // Deduplicate by title + category
      const seen = new Set();
      let products = combined.filter(p => {
        const key = `${(p.title || '').toLowerCase().trim()}::${(p.category || '').toLowerCase().trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

  // Ensure we have exactly TARGET products (100) for consistent UI
  const TARGET = 100;
      if (products.length > TARGET) {
        products = products.slice(0, TARGET);
      } else if (products.length < TARGET) {
        // Clone existing products to reach TARGET (assign new ids)
        const clones = [];
        let idx = 1;
        while (products.length + clones.length < TARGET) {
          const base = products[(idx - 1) % products.length] || products[0];
          if (!base) break;
          const clone = { ...base, id: `${base.id}-clone-${idx}`, title: `${base.title} (${idx})` };
          clones.push(clone);
          idx += 1;
        }
        products = products.concat(clones).slice(0, TARGET);
      }

      dispatch({ type: PRODUCT_ACTIONS.SET_PRODUCTS, payload: products });

      // Cache the combined products
      localStorage.setItem('ecommerce-products', JSON.stringify(products));
      localStorage.setItem('ecommerce-products-timestamp', Date.now().toString());
    } catch (error) {
      dispatch({ type: PRODUCT_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('ecommerce-products');
    const cacheTimestamp = localStorage.getItem('ecommerce-products-timestamp');
    
    if (cachedData && cacheTimestamp) {
      const now = Date.now();
      const cacheAge = now - parseInt(cacheTimestamp);
      const cacheExpiry = 10 * 60 * 1000; // 10 minutes

      if (cacheAge < cacheExpiry) {
        try {
          const parsedData = JSON.parse(cachedData);
          // Only use cached data if it contains at least TARGET items
          const TARGET = 100;
          if (Array.isArray(parsedData) && parsedData.length >= TARGET) {
            dispatch({ type: PRODUCT_ACTIONS.LOAD_CACHED_DATA, payload: { products: parsedData, loading: false } });
            return;
          }
        } catch (error) {
          console.error('Error loading cached products:', error);
        }
      }
    }
    
    // If no valid cache, fetch fresh data
    fetchProducts();
  }, [fetchProducts]);

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_FILTERS, payload: newFilters });
  }, []);

  const setSortBy = useCallback((sortOption) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_SORT, payload: sortOption });
  }, []);

  const setCurrentPage = useCallback((page) => {
    dispatch({ type: PRODUCT_ACTIONS.SET_CURRENT_PAGE, payload: page });
  }, []);

  // Get filtered and sorted products - memoized for performance
  const getFilteredProducts = useMemo(() => {
    let filtered = [...state.products];

    // Apply filters
    if (state.filters.category) {
      const cat = String(state.filters.category || '').trim().toLowerCase();
      filtered = filtered.filter(product => 
        String(product.category || '').trim().toLowerCase() === cat
      );
    }

    if (state.filters.searchTerm) {
      const raw = String(state.filters.searchTerm || '');
      // Tokenize on word characters, ignore very short tokens to reduce noise
      const tokens = (raw.match(/\w+/g) || []).map(t => t.toLowerCase()).filter(t => t.length > 1);
      if (tokens.length > 0) {
        filtered = filtered.filter(product => {
          const title = (product.title || '').toLowerCase();
          const titleWords = title.match(/\w+/g) || [];

          // require ALL tokens to match in title words only (exact or prefix)
          return tokens.every(token => titleWords.some(w => w === token || w.startsWith(token)));
        });
      }
    }

    filtered = filtered.filter(product =>
      product.price >= state.filters.minPrice && product.price <= state.filters.maxPrice
    );

    // Apply sorting
    switch (state.sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [state.products, state.filters, state.sortBy]);

  // Get paginated products - memoized for performance
  const getPaginatedProducts = useCallback(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    
    return {
      products: getFilteredProducts.slice(startIndex, endIndex),
      totalProducts: getFilteredProducts.length,
      totalPages: Math.ceil(getFilteredProducts.length / state.itemsPerPage)
    };
  }, [getFilteredProducts, state.currentPage, state.itemsPerPage]);

  // Get unique categories - memoized for performance
  const getCategories = useMemo(() => {
    const cats = state.products.map(product => String(product.category || 'uncategorized').trim());
    const categories = [...new Set(cats)];
    return categories.sort();
  }, [state.products]);

  const value = useMemo(() => ({
    ...state,
    fetchProducts,
    setFilters,
    setSortBy,
    setCurrentPage,
    getPaginatedProducts,
    getCategories
  }), [state, fetchProducts, setFilters, setSortBy, setCurrentPage, getPaginatedProducts, getCategories]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

ProductProvider.displayName = 'ProductProvider';