import React from 'react';
import PageTransition from '../components/common/PageTransition';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  ShoppingBag,
  Receipt
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const formatINR = (amount) => `₹${amount.toFixed(2)}`;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, amount } = location.state || {};

  React.useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }

    // Clear the history stack by replacing payment gateway with home
    // This ensures back button goes to home instead of payment gateway
    const currentState = { orderId, amount };
    window.history.replaceState(currentState, '', window.location.pathname);
    
    // Push a dummy state and then replace it to clear forward navigation
    window.history.pushState(null, '', window.location.pathname);
    window.history.replaceState(currentState, '', window.location.pathname);
    
    // Intercept back button
    const handlePopState = () => {
      // Navigate to home when back button is pressed
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [orderId, amount, navigate]);

  return (
    <PageTransition>
    <Box sx={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 4,
      px: 2
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 5 }, 
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3 
        }}
      >
        <Box 
          sx={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            bgcolor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'scaleIn 0.5s ease-out'
          }}
        >
          <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
          Payment Successful!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Thank you for your purchase. Your order has been confirmed.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Order ID
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              #{orderId}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Amount Paid
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatINR(amount || 0)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Payment Status
            </Typography>
            <Box sx={{ 
              bgcolor: 'success.main', 
              color: 'white', 
              px: 2, 
              py: 0.5, 
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              COMPLETED
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A confirmation email has been sent to your registered email address.
          You can track your order from your profile.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Receipt />}
            onClick={() => navigate('/profile')}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            View Orders
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/products')}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            Continue Shopping
          </Button>
        </Stack>

        <style>
          {`
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}
        </style>
      </Paper>
    </Box>
    </PageTransition>
  );
};

export default PaymentSuccessPage;
