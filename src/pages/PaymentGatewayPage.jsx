import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  LinearProgress,
  Alert,
  Divider,
  Stack,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Lock,
  CreditCard,
  CheckCircle,
  Visibility,
  VisibilityOff,
  AccountBalance,
  LocalAtm
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/useUser';
import { useCart } from '../contexts/CartContext';

const formatINR = (amount) => `₹${amount.toFixed(2)}`;

const PaymentGatewayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser, user } = useUser();
  const { clearCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showCVV, setShowCVV] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Get order data from location state
  const orderData = location.state?.orderData;
  const buyNowMode = location.state?.buyNowMode;
  const paymentMethod = orderData?.paymentMethod;

  useEffect(() => {
    if (!orderData) {
      navigate('/cart');
    }
  }, [orderData, navigate]);

  useEffect(() => {
    let stageTimer;
    let progressTimer;

    if (processing) {
      const stages = [
        'Verifying payment details...',
        'Processing payment...',
        'Confirming transaction...',
        'Finalizing order...'
      ];
      
      setProcessingStage(stages[0]);
      setProgress(0);
      setShowModal(true);
      
      let currentStage = 1;
      
      stageTimer = setInterval(() => {
        if (currentStage < stages.length) {
          setProcessingStage(stages[currentStage]);
          currentStage++;
        }
      }, 650);

      progressTimer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return newProgress;
        });
      }, 125);
    } else {
      setShowModal(false);
      setProgress(0);
      setProcessingStage('');
    }

    return () => {
      if (stageTimer) clearInterval(stageTimer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [processing]);

  const [cardDetails, setCardDetails] = useState({
    number: orderData?.cardDetails?.number || '',
    name: orderData?.cardDetails?.name || '',
    expiry: orderData?.cardDetails?.exp || '',
    cvv: orderData?.cardDetails?.cvv || ''
  });

  const [upiId, setUpiId] = useState(orderData?.upiDetails?.id || '');

  const [fieldErrors, setFieldErrors] = useState({});

  const validateCardNumber = (num) => /^\d{16}$/.test(num.replace(/\s/g, ''));
  const validateExpiry = (exp) => /^(0[1-9]|1[0-2])\/(\d{2})$/.test(exp);
  const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);
  const validateNotEmpty = (val) => val && val.trim().length > 0;
  const validateUPI = (id) => validateNotEmpty(id) && id.includes('@');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardDetails({ ...cardDetails, number: formatted });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardDetails({ ...cardDetails, expiry: value });
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardDetails({ ...cardDetails, cvv: value });
  };

  const validateAll = () => {
    const newErrors = {};
    
    if (paymentMethod === 'card') {
      if (!validateNotEmpty(cardDetails.name)) newErrors.name = 'Cardholder name is required';
      if (!validateCardNumber(cardDetails.number)) newErrors.number = 'Enter a valid 16-digit card number';
      if (!validateExpiry(cardDetails.expiry)) newErrors.expiry = 'Expiry must be MM/YY';
      if (!validateCVV(cardDetails.cvv)) newErrors.cvv = 'CVV must be 3 or 4 digits';
    } else if (paymentMethod === 'upi') {
      if (!validateUPI(upiId)) newErrors.upiId = 'Enter a valid UPI ID (e.g., name@bank)';
    }
    // COD doesn't need validation
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const completeOrder = (paymentDetails) => {
    // Save order to user profile
    updateUser({
      orders: [
        ...(user.orders || []),
        {
          ...orderData,
          id: orderData.id,
          payment: paymentDetails,
          status: 'confirmed',
          date: new Date().toISOString()
        }
      ]
    });

    // Clear cart if not buy now mode
    if (!buyNowMode) {
      clearCart();
    }

    // Navigate to success page (replace to prevent back navigation to gateway)
    setTimeout(() => {
      navigate('/payment-success', { 
        state: { 
          orderId: orderData.id,
          amount: orderData.amounts.totalINR,
          paymentMethod: paymentMethod
        },
        replace: true
      });
    }, 500);
  };

  const handlePayment = () => {
    if (!validateAll()) {
      setError('Please correct the highlighted fields');
      return;
    }

    setError('');
    setProcessing(true);

    // Simulate payment processing (2.6 seconds)
    setTimeout(() => {
      // Check for demo failure card (only for card payments)
      if (paymentMethod === 'card' && cardDetails.number.replace(/\s/g, '') === '4111111111111112') {
        setProcessing(false);
        setError('Payment declined. Please check your card details and try again.');
        setProgress(0);
        setProcessingStage('');
        return;
      }

      // Success - prepare payment details based on method
      let paymentDetails = {};
      
      if (paymentMethod === 'card') {
        paymentDetails = {
          method: 'card',
          last4: cardDetails.number.slice(-4),
          status: 'completed',
          cardHolder: cardDetails.name
        };
      } else if (paymentMethod === 'upi') {
        paymentDetails = {
          method: 'upi',
          upiId: upiId,
          status: 'completed'
        };
      } else if (paymentMethod === 'cod') {
        paymentDetails = {
          method: 'cod',
          status: 'pending',
          note: 'Payment to be collected on delivery'
        };
      }

      completeOrder(paymentDetails);
    }, 2600);
  };

  // Processing Modal - Memoized to prevent re-renders
  const ProcessingModal = React.useMemo(() => (
      <Dialog 
        open={showModal && processing} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown
        keepMounted={false}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }
        }}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            bgcolor: 'background.paper'
          }
        }}
      >
      <DialogContent sx={{ py: 6, px: 4, textAlign: 'center' }}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.05);
                opacity: 0.8;
              }
            }
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
        
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          animation: 'pulse 1.5s ease-in-out infinite',
          willChange: 'transform'
        }}>
          <Lock sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Processing Payment
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {processingStage || 'Initializing...'}
        </Typography>

        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                transition: 'transform 0.2s linear'
              }
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {Math.round(progress)}%
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Please do not close this window or press back button
        </Typography>
      </DialogContent>
    </Dialog>
  ), [showModal, processing, progress, processingStage]);

  if (!orderData) {
    return null;
  }

  return (
    <>
      {ProcessingModal}
      
      <Box sx={{ minHeight: '80vh', opacity: processing ? 0.5 : 1, pointerEvents: processing ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Secure Payment Gateway
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {paymentMethod === 'card' && 'Enter your card details to complete payment'}
                {paymentMethod === 'upi' && 'Enter your UPI ID to complete payment'}
                {paymentMethod === 'cod' && 'Confirm your Cash on Delivery order'}
              </Typography>
            </Box>
            <Lock sx={{ fontSize: 40, opacity: 0.8 }} />
          </Box>
        </Paper>

        {/* Order Summary */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Order Summary
          </Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Items Total</Typography>
              <Typography fontWeight={600}>{formatINR(orderData.amounts.subtotalINR)}</Typography>
            </Box>
            {orderData.amounts.discountINR > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Discount</Typography>
                <Typography fontWeight={600} color="success.main">
                  -{formatINR(orderData.amounts.discountINR)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography fontWeight={600}>
                {orderData.amounts.shippingINR === 0 ? 'Free' : formatINR(orderData.amounts.shippingINR)}
              </Typography>
            </Box>
            {orderData.amounts.codFeeINR > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">COD Fee</Typography>
                <Typography fontWeight={600}>{formatINR(orderData.amounts.codFeeINR)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Tax (8%)</Typography>
              <Typography fontWeight={600}>{formatINR(orderData.amounts.taxINR)}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Amount</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatINR(orderData.amounts.totalINR)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Payment Form */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {paymentMethod === 'card' && <CreditCard sx={{ mr: 1, color: 'primary.main' }} />}
            {paymentMethod === 'upi' && <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />}
            {paymentMethod === 'cod' && <LocalAtm sx={{ mr: 1, color: 'primary.main' }} />}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {paymentMethod === 'card' && 'Card Payment'}
              {paymentMethod === 'upi' && 'UPI Payment'}
              {paymentMethod === 'cod' && 'Cash on Delivery'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Card Number"
                  fullWidth
                  value={cardDetails.number}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  error={!!fieldErrors.number}
                  helperText={fieldErrors.number}
                  disabled={processing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Cardholder Name"
                  fullWidth
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                  placeholder="JOHN DOE"
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  disabled={processing}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Expiry Date"
                  fullWidth
                  value={cardDetails.expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  error={!!fieldErrors.expiry}
                  helperText={fieldErrors.expiry}
                  disabled={processing}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="CVV"
                  fullWidth
                  type={showCVV ? 'text' : 'password'}
                  value={cardDetails.cvv}
                  onChange={handleCVVChange}
                  placeholder="123"
                  error={!!fieldErrors.cvv}
                  helperText={fieldErrors.cvv}
                  disabled={processing}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCVV(!showCVV)}
                          edge="end"
                          disabled={processing}
                        >
                          {showCVV ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Test card: 4111 1111 1111 1111 (Success) | 4111 1111 1111 1112 (Failure)
                </Typography>
              </Grid>
            </Grid>
          )}

          {/* UPI Payment Form */}
          {paymentMethod === 'upi' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="UPI ID"
                  fullWidth
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  error={!!fieldErrors.upiId}
                  helperText={fieldErrors.upiId || 'Enter your UPI ID (e.g., 9876543210@upi)'}
                  disabled={processing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  You will be redirected to your UPI app to complete the payment.
                </Alert>
              </Grid>
            </Grid>
          )}

          {/* COD Confirmation */}
          {paymentMethod === 'cod' && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Cash on Delivery Selected
                </Typography>
                <Typography variant="body2">
                  • You will pay {formatINR(orderData.amounts.totalINR)} (including ₹{orderData.amounts.codFeeINR} COD fee) when the order is delivered.
                </Typography>
                <Typography variant="body2">
                  • Please keep exact change ready for faster delivery.
                </Typography>
                <Typography variant="body2">
                  • You can inspect the product before making payment.
                </Typography>
              </Alert>
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'success.lighter',
                border: '2px solid',
                borderColor: 'success.main'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    Order Ready to Confirm
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Click the button below to confirm your order. Our delivery partner will contact you shortly.
                </Typography>
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePayment}
            disabled={processing}
            sx={{ 
              mt: 3, 
              py: 1.5,
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
          >
            {processing ? 'Processing...' : 
             paymentMethod === 'cod' ? 'Confirm Order' : 
             `Pay ${formatINR(orderData.amounts.totalINR)}`}
          </Button>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Your payment is secured with 256-bit SSL encryption
            </Typography>
          </Box>
        </Paper>
        </Box>
      </Box>
    </>
  );
};

export default PaymentGatewayPage;
