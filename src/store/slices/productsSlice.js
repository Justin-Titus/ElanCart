import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

const CACHE_KEY = 'ecommerce-products';
const CACHE_TIMESTAMP_KEY = 'ecommerce-products-timestamp';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const TARGET = 100;

const mapDummyJsonProduct = (p) => ({
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
});

const normalizeProducts = (combined) => {
  // Deduplicate by title + category
  const seen = new Set();
  let products = combined.filter(p => {
    const key = `${(p.title || '').toLowerCase().trim()}::${(p.category || '').toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ensure exactly TARGET products for consistent UI
  if (products.length > TARGET) {
    products = products.slice(0, TARGET);
  } else if (products.length < TARGET && products.length > 0) {
    const clones = [];
    let idx = 1;
    while (products.length + clones.length < TARGET) {
      const base = products[(idx - 1) % products.length];
      if (!base) break;
      clones.push({ ...base, id: `${base.id}-clone-${idx}`, title: `${base.title} (${idx})` });
      idx += 1;
    }
    products = products.concat(clones).slice(0, TARGET);
  }
  return products;
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      let combined = [];
      try {
        const response = await axios.get('https://dummyjson.com/products?limit=100');
        combined = (response.data?.products || []).map(mapDummyJsonProduct);
      } catch {
        // Fallback retry
        const response = await axios.get('https://dummyjson.com/products?limit=100');
        combined = (response.data?.products || []).map(mapDummyJsonProduct);
      }

      const products = normalizeProducts(combined);

      // Cache the products
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(products));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch {
        // ignore storage errors
      }

      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Returns cached products if fresh enough, otherwise null
export const readProductsCache = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (cachedData && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      if (cacheAge < CACHE_EXPIRY) {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length >= TARGET) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.error('Error loading cached products:', error);
  }
  return null;
};

const initialState = {
  products: [],
  loading: true,
  error: null,
  filters: {
    category: '',
    minPrice: 0,
    maxPrice: Infinity,
    searchTerm: ''
  },
  sortBy: '',
  currentPage: 1,
  itemsPerPage: 12
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    loadCachedProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch products';
        state.loading = false;
      });
  }
});

export const { setFilters, setSortBy, setCurrentPage, loadCachedProducts } = productsSlice.actions;

// Base selectors
export const selectProductsState = (state) => state.products;
export const selectProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectFilters = (state) => state.products.filters;
export const selectSortBy = (state) => state.products.sortBy;
export const selectCurrentPage = (state) => state.products.currentPage;
export const selectItemsPerPage = (state) => state.products.itemsPerPage;

// Memoized: filtered + sorted products
export const selectFilteredProducts = createSelector(
  [selectProducts, selectFilters, selectSortBy],
  (products, filters, sortBy) => {
    let filtered = [...products];

    if (filters.category) {
      const cat = String(filters.category || '').trim().toLowerCase();
      filtered = filtered.filter(product =>
        String(product.category || '').trim().toLowerCase() === cat
      );
    }

    if (filters.searchTerm) {
      const raw = String(filters.searchTerm || '');
      const tokens = (raw.match(/\w+/g) || []).map(t => t.toLowerCase()).filter(t => t.length > 1);
      if (tokens.length > 0) {
        filtered = filtered.filter(product => {
          const title = (product.title || '').toLowerCase();
          const titleWords = title.match(/\w+/g) || [];
          return tokens.every(token => titleWords.some(w => w === token || w.startsWith(token)));
        });
      }
    }

    const minPriceFilter = typeof filters.minPrice === 'number' ? filters.minPrice : -Infinity;
    const maxPriceFilter = filters.maxPrice === Infinity || typeof filters.maxPrice === 'number'
      ? filters.maxPrice
      : Infinity;

    filtered = filtered.filter(product => product.price >= minPriceFilter && product.price <= maxPriceFilter);

    switch (sortBy) {
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
  }
);

// Memoized: paginated products
export const selectPaginatedProducts = createSelector(
  [selectFilteredProducts, selectCurrentPage, selectItemsPerPage],
  (filtered, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      products: filtered.slice(startIndex, endIndex),
      totalProducts: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }
);

// Memoized: unique categories
export const selectCategories = createSelector(
  [selectProducts],
  (products) => {
    const cats = products.map(product => String(product.category || 'uncategorized').trim());
    return [...new Set(cats)].sort();
  }
);

export default productsSlice.reducer;
