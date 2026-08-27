import React, { useEffect, memo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { fetchProducts, loadCachedProducts, readProductsCache } from './store/slices/productsSlice';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import OptimizedRouter from './components/common/OptimizedRouter';
import theme from './theme';



const App = memo(() => {
  const dispatch = useDispatch();

  // Bootstrap products: use fresh cache if available, otherwise fetch
  useEffect(() => {
    const cached = readProductsCache();
    if (cached) {
      dispatch(loadCachedProducts(cached));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch]);

  // Optimized prefetching - only prefetch most critical routes
  useEffect(() => {
    const preloads = [
      () => import('./pages/ProductsPage'),
      () => import('./pages/CartPage')
    ];
    
    // Use a more aggressive prefetching strategy
    const prefetchRoutes = () => {
      preloads.forEach(loader => {
        try {
          loader();
        } catch (error) {
          if (import.meta.env.MODE === 'development') {
            console.warn('Route prefetch failed:', error);
          }
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 1000 });
    } else {
      setTimeout(prefetchRoutes, 500);
    }
  }, []);
  return (
    <ErrorBoundary>
  {/* PerformanceMonitor removed from production build - keep monitoring out of the bundle */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ScrollToTop />
          <Layout>
            <OptimizedRouter />
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;
