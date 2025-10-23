import React, { memo, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './ProtectedRoute';
import RoutePreloader from './RoutePreloader';

// Lazy load pages with optimized chunking
const HomePage = React.lazy(() => import('../../pages/HomePage'));
const ProductsPage = React.lazy(() => import('../../pages/ProductsPage'));
const AboutPage = React.lazy(() => import('../../pages/AboutPage'));
const ContactPage = React.lazy(() => import('../../pages/ContactPage'));
const CartPage = React.lazy(() => import('../../pages/CartPage'));
const ProductDetailPage = React.lazy(() => import('../../pages/ProductDetailPage'));
const FavouritesPage = React.lazy(() => import('../../pages/FavouritesPage'));
const ProfilePage = React.lazy(() => import('../../pages/ProfilePage'));
const LoginPage = React.lazy(() => import('../../pages/LoginPage'));
const CheckoutPage = React.lazy(() => import('../../pages/CheckoutPage'));
const PaymentGatewayPage = React.lazy(() => import('../../pages/PaymentGatewayPage'));
const PaymentSuccessPage = React.lazy(() => import('../../pages/PaymentSuccessPage'));

// Minimal loading component
const MinimalLoader = memo(() => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px'
    }}
  >
    <CircularProgress size={32} />
  </Box>
));

const OptimizedRouter = memo(() => {
  return (
    <>
      <RoutePreloader />
      <Suspense fallback={<MinimalLoader />}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/payment-gateway" element={
          <ProtectedRoute>
            <PaymentGatewayPage />
          </ProtectedRoute>
        } />
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<div>Page not found - <a href="/">Go home</a></div>} />
      </Routes>
      </Suspense>
    </>
  );
});

OptimizedRouter.displayName = 'OptimizedRouter';

export default OptimizedRouter;