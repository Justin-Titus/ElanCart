import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import SplitText from '../components/common/SplitText';
import {
  Box,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ShoppingCartOutlined,
  ArrowBack,
  CreditCard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useBuyNow } from '../hooks/useBuyNow';
import CartItem from '../components/cart/CartItem';
const formatINR = (amount) => `₹${amount.toFixed(2)}`;

const CartPage = () => {
  const navigate = useNavigate();
  const { cartState, clearCart } = useCart();
  const { clearBuyNowData } = useBuyNow();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleContinueShopping = () => {
    navigate('/products');
  };


  const handleCheckout = () => {
    // Clear any existing buyNow data when navigating from cart
    clearBuyNowData();
    navigate('/checkout', {
      state: { fromCart: true }
    });
  };

  const handleClearCart = () => {
    if (cartState.items.length === 0) return;
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (cartState.items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <ShoppingCartOutlined
          sx={{
            fontSize: 120,
            color: 'text.secondary',
            mb: 2
          }}
        />
        <Typography variant="h4" gutterBottom color="text.secondary">
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Looks like you haven't added any items to your cart yet.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBack />}
          onClick={handleContinueShopping}
        >
          {!isMobile && 'Continue Shopping'}
        </Button>
      </Box>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleContinueShopping}
          color="primary"
        >
          {!isMobile && 'Continue Shopping'}
        </Button>
        <SplitText 
          text={`Shopping Cart (${cartState.items.length} items)`}
          tag="h1"
          className="cart-title"
          delay={50}
          duration={0.5}
          splitType="words"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Items in your cart
            </Typography>
            <Button
              color="error"
              onClick={handleClearCart}
              size="small"
            >
              Clear Cart
            </Button>
          </Box>

          {cartState.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                {cartState.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {item.title.length > 30 
                        ? `${item.title.substring(0, 30)}...` 
                        : item.title
                      } × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ₹{(item.price * item.quantity * 83).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/** Pricing summary: subtotal (INR), shipping, tax, grand total */}
              {(() => {
                const subtotalINR = Number(cartState.total * 83 || 0);
                const shippingFeeINR = subtotalINR >= 4150 ? 0 : 199; // standard shipping rules
                const taxINR = subtotalINR * 0.08; // 8% tax
                const grandTotalINR = subtotalINR + shippingFeeINR + taxINR;
                return (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1">{formatINR(subtotalINR)}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                      <Typography variant="body2" color="text.secondary">{shippingFeeINR === 0 ? 'Free' : formatINR(shippingFeeINR)}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Tax:</Typography>
                      <Typography variant="body2" color="text.secondary">{formatINR(taxINR)}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">{formatINR(grandTotalINR)}</Typography>
                    </Box>
                  </>
                );
              })()}
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<CreditCard />}
                onClick={handleCheckout}
                sx={{ mb: 2 }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </motion.div>
  );
};

export default CartPage;