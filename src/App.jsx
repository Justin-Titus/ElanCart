import React, { useEffect, memo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { FavouritesProvider } from './contexts/FavouritesContext';
import { UserProvider } from './contexts/UserContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import OptimizedRouter from './components/common/OptimizedRouter';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import theme from './theme';



const App = memo(() => {
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
          console.warn('Route prefetch failed:', error);
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
      {import.meta.env.DEV && <PerformanceMonitor />}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <FavouritesProvider>
            <CartProvider>
              <ProductProvider>
                <Router>
                  <ScrollToTop />
                  <Layout>
                    <OptimizedRouter />
                  </Layout>
                </Router>
              </ProductProvider>
            </CartProvider>
          </FavouritesProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;
