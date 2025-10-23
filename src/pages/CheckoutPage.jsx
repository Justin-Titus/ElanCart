import React from 'react';
import PageTransition from '../components/common/PageTransition';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
  Stack,
  Alert,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useUser } from '../contexts/useUser';
import { useCart } from '../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBuyNow } from '../hooks/useBuyNow';

const formatINR = (amount) => `₹${amount.toFixed(2)}`;

const CheckoutPage = () => {
  const { user } = useUser();
  const { cartState } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { buyNowData, isLoading: buyNowLoading, clearBuyNowData } = useBuyNow();

  const [contact, setContact] = React.useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  // Helper to clear field error for a field if valid
  const clearFieldError = (field, value) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      switch (field) {
        case 'fullName':
          if (validateNotEmpty(value)) delete updated.fullName;
          break;
        case 'email':
          if (validateEmail(value)) delete updated.email;
          break;
        case 'phone':
          if (validatePhone(value)) delete updated.phone;
          break;
        case 'address1':
          if (validateNotEmpty(value)) delete updated.address1;
          break;
        case 'city':
          if (validateNotEmpty(value)) delete updated.city;
          break;
        case 'state':
          if (validateNotEmpty(value)) delete updated.state;
          break;
        case 'postalCode':
          if (validatePostalCode(value)) delete updated.postalCode;
          break;
        case 'billingAddress1':
          if (validateNotEmpty(value)) delete updated.billingAddress1;
          break;
        case 'billingCity':
          if (validateNotEmpty(value)) delete updated.billingCity;
          break;
        case 'billingState':
          if (validateNotEmpty(value)) delete updated.billingState;
          break;
        case 'billingPostalCode':
          if (validatePostalCode(value)) delete updated.billingPostalCode;
          break;
        case 'nameOnCard':
          if (validateNotEmpty(value)) delete updated.nameOnCard;
          break;
        case 'cardNumber':
          if (validateCardNumber(value)) delete updated.cardNumber;
          break;
        case 'expiry':
          if (validateExpiry(value)) delete updated.expiry;
          break;
        case 'cvv':
          if (validateCVV(value)) delete updated.cvv;
          break;
        case 'upiId':
          if (validateNotEmpty(value) && value.includes('@')) delete updated.upiId;
          break;
        default:
          break;
      }
      return updated;
    });
  };

  // Helpers for immediate field-level validation (shipping/billing/contact)
  const setFieldError = (field, msg) => setFieldErrors(prev => ({ ...prev, [field]: msg }));

  const [shipping, setShipping] = React.useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Sanitizers and onBlur handlers
  const handlePostalChange = (value, target = 'shipping') => {
    const digits = value.replace(/\D/g, '');
    if (target === 'shipping') setShipping(s => ({ ...s, postalCode: digits }));
    else setBilling(b => ({ ...b, postalCode: digits }));
  };

  const handlePhoneChange = (val) => {
    setContact(c => ({ ...c, phone: val.replace(/\D/g, '') }));
    clearFieldError('phone', val);
  };

  // Prefill phone and shipping address from profile when available (do not override user-edits)
  React.useEffect(() => {
    if (!user) return;
    // Prefill contact fields only if they are empty
    setContact(prev => ({
      fullName: prev.fullName || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || ''
    }));

    // If user has an address string, try to parse it into structured fields and prefill any empty shipping fields
    if (user.address) {
      const parseAddressString = (addrString) => {
        // Expected formatted string from profile: "address1, address2, city, state postalCode, country"
        // We'll be defensive: split by commas, trim, and attempt to extract state/postal pair
        const parts = addrString.split(',').map(p => p.trim()).filter(Boolean);
        const out = { address1: '', address2: '', city: '', state: '', postalCode: '', country: 'India' };
        if (parts.length === 1) {
          out.address1 = parts[0];
          return out;
        }
        // Typical: [address1, address2?, city, statePostal, country?]
        out.address1 = parts[0] || '';
        if (parts.length === 2) {
          // address1, rest
          out.address2 = '';
          out.city = parts[1] || '';
          return out;
        }
        // If there are 3 parts, assume: address1, city, statePostalOrCountry
        if (parts.length === 3) {
          out.address2 = '';
          out.city = parts[1] || '';
          const maybeStatePostal = parts[2] || '';
          const sp = maybeStatePostal.split(' ').filter(p => p);
          if (sp.length >= 2) {
            out.postalCode = sp[sp.length - 1];
            out.state = sp.slice(0, -1).join(' ');
          } else {
            out.state = maybeStatePostal;
          }
          return out;
        }
        // 4+ parts: address1, address2, city, statePostal, country?
        out.address2 = parts[1] || '';
        out.city = parts[2] || '';
        const statePostal = parts[3] || '';
        const spParts = statePostal.split(' ').filter(p => p);
        if (spParts.length >= 2) {
          out.postalCode = spParts[spParts.length - 1];
          out.state = spParts.slice(0, -1).join(' ');
        } else {
          out.state = statePostal;
        }
        out.country = parts[4] || out.country;
        return out;
      };

      const parsed = parseAddressString(user.address);
      setShipping(prev => ({
        address1: prev.address1 || parsed.address1 || '',
        address2: prev.address2 || parsed.address2 || '',
        city: prev.city || parsed.city || '',
        state: prev.state || parsed.state || '',
        postalCode: prev.postalCode || parsed.postalCode || '',
        country: prev.country || parsed.country || 'India'
      }));
    }
  // Intentionally include shipping.address1 in deps to avoid stale check but avoid overwriting edits
  }, [user]);

  const [billingSame, setBillingSame] = React.useState(true);
  const [billing, setBilling] = React.useState({
    address1: '', address2: '', city: '', state: '', postalCode: '', country: 'India'
  });

  const [deliveryMethod, setDeliveryMethod] = React.useState('standard'); // standard | express
  const [paymentMethod, setPaymentMethod] = React.useState('card'); // card | upi | cod
  // Promo code removed

  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [card, setCard] = React.useState({ name: '', number: '', exp: '', cvv: '' });
  const [upi, setUpi] = React.useState({ id: '' });
  const [agree, setAgree] = React.useState(false);

  // Validation helpers
  const validateEmail = email => /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePhone = phone => /^\d{10}$/.test(phone);
  const validatePostalCode = code => /^\d{5,6}$/.test(code);
  const validateCardNumber = num => /^\d{16}$/.test(num.replace(/\s/g, ''));
  const validateExpiry = exp => /^(0[1-9]|1[0-2])\/(\d{2})$/.test(exp);
  const validateCVV = cvv => /^\d{3,4}$/.test(cvv);
  const validateNotEmpty = val => val && val.trim().length > 0;

  const validateAll = () => {
    const newErrors = {};
    // Contact
    if (!validateNotEmpty(contact.fullName)) newErrors.fullName = 'Full name is required.';
    if (!validateEmail(contact.email)) newErrors.email = 'Enter a valid email.';
    if (!validatePhone(contact.phone)) newErrors.phone = 'Enter a valid 10-digit phone.';
    // Shipping
    if (!validateNotEmpty(shipping.address1)) newErrors.address1 = 'Address line 1 required.';
    if (!validateNotEmpty(shipping.city)) newErrors.city = 'City required.';
    if (!validateNotEmpty(shipping.state)) newErrors.state = 'State required.';
    if (!validatePostalCode(shipping.postalCode)) newErrors.postalCode = 'Valid postal code required.';
    // Payment
    if (paymentMethod === 'card') {
      if (!validateCardNumber(card.number)) newErrors.cardNumber = 'Enter a valid 16-digit card number.';
      if (!validateExpiry(card.exp)) newErrors.expiry = 'Expiry must be MM/YY.';
      if (!validateCVV(card.cvv)) newErrors.cvv = 'CVV must be 3 or 4 digits.';
      if (!validateNotEmpty(card.name)) newErrors.nameOnCard = 'Name on card required.';
    }
    if (paymentMethod === 'upi') {
      if (!validateNotEmpty(upi.id) || !upi.id.includes('@')) newErrors.upiId = 'Enter a valid UPI ID.';
    }
    // Billing
    if (!billingSame) {
      if (!validateNotEmpty(billing.address1)) newErrors.billingAddress1 = 'Address line 1 required.';
      if (!validateNotEmpty(billing.city)) newErrors.billingCity = 'City required.';
      if (!validateNotEmpty(billing.state)) newErrors.billingState = 'State required.';
      if (!validatePostalCode(billing.postalCode)) newErrors.billingPostalCode = 'Valid postal code required.';
    }
    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) setError('Please correct the highlighted fields.');
    else setError('');
    return newErrors; // return the errors object so caller can inspect and scroll
  };

  // ...existing code...

  // Support Buy Now direct checkout
  // Determine the source of checkout items
  const getCheckoutData = () => {
    // If explicitly coming from cart, always use cart items
    if (location.state?.fromCart === true) {
      // Clear any stale buyNow data
      if (buyNowData) {
        clearBuyNowData();
      }
      return { items: cartState.items, buyNowMode: false };
    }
    
    // If coming with buyNow data (direct navigation when user is already authenticated)
    if (location.state?.buyNow === true && Array.isArray(location.state?.items) && location.state.items.length > 0) {
      return { items: location.state.items, buyNowMode: true };
    }
    
    // Then check hook data (from sessionStorage after login redirect)
    if (buyNowData?.buyNow === true && Array.isArray(buyNowData?.items) && buyNowData.items.length > 0) {
      return { items: buyNowData.items, buyNowMode: true };
    }
    
    // Fallback to cart items
    return { items: cartState.items, buyNowMode: false };
  };

  const { items: checkoutItems, buyNowMode } = getCheckoutData();

  // Clear buyNow data when component unmounts if we're in cart mode
  React.useEffect(() => {
    return () => {
      if (location.state?.fromCart && buyNowData) {
        clearBuyNowData();
      }
    };
  }, [location.state?.fromCart, buyNowData, clearBuyNowData]);

  // Don't render until buyNow hook has loaded
  if (buyNowLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!checkoutItems.length) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Your cart is empty.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Shop Now</Button>
      </Box>
    );
  }

  // Pricing (use INR for display)
  const subtotalINR = checkoutItems.reduce((sum, it) => sum + it.price * it.quantity * 83, 0);
  // Promo code removed
  const promoDiscountINR = 0;
  const afterDiscount = subtotalINR;
  const shippingFeeINR = deliveryMethod === 'express' ? 499 : afterDiscount >= 4150 ? 0 : 199;
  const codFeeINR = paymentMethod === 'cod' ? 49 : 0;
  const taxINR = afterDiscount * 0.08; // 8% on items
  const grandTotalINR = afterDiscount + shippingFeeINR + codFeeINR + taxINR;

  // Promo code removed

  // ...existing code...

  // (moved to top)

  const handlePlaceOrder = () => {
    // Validate inputs first
    const errors = validateAll();
    if (errors && Object.keys(errors).length > 0) {
      // preferred order to navigate to the first error
      const order = [
        'fullName','email','phone',
        'address1','postalCode','city','state',
        'nameOnCard','cardNumber','expiry','cvv','upiId',
        'billingAddress1','billingPostalCode','billingCity','billingState'
      ];
      const first = order.find(f => errors[f]);
      if (first) {
        const el = document.getElementById(first);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          try { el.focus(); } catch { /* ignore */ }
        }
      }
      return;
    }
    // Inputs are valid; now require agreement
    if (!agree) {
      setError('Please agree to the terms and conditions.');
      const agreeEl = document.getElementById('agree');
      if (agreeEl && typeof agreeEl.scrollIntoView === 'function') {
        agreeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  try { agreeEl.focus(); } catch { /* ignore */ }
      }
      return;
    }

    // Prepare order data
    const combinedAddress = `${shipping.address1}${shipping.address2 ? ', ' + shipping.address2 : ''}, ${shipping.city}, ${shipping.state} ${shipping.postalCode}, ${shipping.country}`;
    const billingAddress = billingSame
      ? combinedAddress
      : `${billing.address1}${billing.address2 ? ', ' + billing.address2 : ''}, ${billing.city}, ${billing.state} ${billing.postalCode}, ${billing.country}`;

    const orderData = {
      id: Date.now(),
      items: checkoutItems,
      amounts: {
        subtotalINR: Number(subtotalINR.toFixed(2)),
        discountINR: Number(promoDiscountINR.toFixed(2)),
        shippingINR: shippingFeeINR,
        codFeeINR,
        taxINR: Number(taxINR.toFixed(2)),
        totalINR: Number(grandTotalINR.toFixed(2)),
      },
      contact,
      shipping: { ...shipping, addressFormatted: combinedAddress },
      billing: { sameAsShipping: billingSame, ...billing, addressFormatted: billingAddress },
      deliveryMethod,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? card : null,
      upiDetails: paymentMethod === 'upi' ? upi : null,
    };

    // Clear buyNow data if this was a buyNow checkout
    if (buyNowMode) {
      clearBuyNowData();
    }

    // Navigate to payment gateway for all payment methods
    navigate('/payment-gateway', { 
      state: { 
        orderData,
        buyNowMode 
      } 
    });
  };

  return (
    <PageTransition>
    <Box>
      <Grid container spacing={3}>
        {/* Left: Forms */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Contact</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField id="fullName" label="Full name" fullWidth value={contact.fullName} onChange={e => { setContact(v => ({ ...v, fullName: e.target.value })); clearFieldError('fullName', e.target.value); }} error={!!fieldErrors.fullName} helperText={fieldErrors.fullName} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="phone"
                  label="Phone"
                  fullWidth
                  value={contact.phone}
                  onChange={e => { handlePhoneChange(e.target.value); }}
                  onBlur={() => { if (!validatePhone(contact.phone)) setFieldError('phone', 'Enter a valid 10-digit phone.'); else clearFieldError('phone', contact.phone); }}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  inputProps={{ inputMode: 'tel', pattern: '[0-9]*' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField id="email" label="Email" type="email" fullWidth value={contact.email} onChange={e => { setContact(v => ({ ...v, email: e.target.value })); clearFieldError('email', e.target.value); }} error={!!fieldErrors.email} helperText={fieldErrors.email} />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Shipping address</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField id="address1" label="Address line 1" fullWidth value={shipping.address1} onChange={e => { setShipping(v => ({ ...v, address1: e.target.value })); clearFieldError('address1', e.target.value); }} error={!!fieldErrors.address1} helperText={fieldErrors.address1} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address line 2 (optional)" fullWidth value={shipping.address2} onChange={e => setShipping(v => ({ ...v, address2: e.target.value }))} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Postal code"
                  id="postalCode"
                  fullWidth
                  value={shipping.postalCode}
                  onChange={e => { handlePostalChange(e.target.value, 'shipping'); }}
                  onBlur={() => { if (!validatePostalCode(shipping.postalCode)) setFieldError('postalCode', 'Valid postal code required.'); else clearFieldError('postalCode', shipping.postalCode); }}
                  error={!!fieldErrors.postalCode}
                  helperText={fieldErrors.postalCode}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  id="city"
                  fullWidth
                  value={shipping.city}
                  onChange={e => { setShipping(v => ({ ...v, city: e.target.value.replace(/\d/g, '') })); clearFieldError('city', e.target.value); }}
                  onBlur={() => { const v = (shipping.city || '').trim(); if (!validateNotEmpty(v)) setFieldError('city', 'City required.'); else if (/\d/.test(v)) setFieldError('city', 'City cannot contain numbers.'); else clearFieldError('city', v); }}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="State"
                  id="state"
                  fullWidth
                  value={shipping.state}
                  onChange={e => { setShipping(v => ({ ...v, state: e.target.value.replace(/\d/g, '') })); clearFieldError('state', e.target.value); }}
                  onBlur={() => { const v = (shipping.state || '').trim(); if (!validateNotEmpty(v)) setFieldError('state', 'State required.'); else if (/\d/.test(v)) setFieldError('state', 'State cannot contain numbers.'); else clearFieldError('state', v); }}
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Country"
                  fullWidth
                  value={shipping.country}
                  onChange={e => setShipping(v => ({ ...v, country: e.target.value.replace(/\d/g, '') }))}
                  onBlur={() => { const v = (shipping.country || '').trim(); if (!validateNotEmpty(v)) setFieldError('country', 'Country required.'); else if (/\d/.test(v)) setFieldError('country', 'Country cannot contain numbers.'); else clearFieldError('country', v); }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Delivery method</Typography>
            <FormControl>
              <RadioGroup row value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value)}>
                <FormControlLabel value="standard" control={<Radio />} label={`Standard (3-5 days) · ${shippingFeeINR === 0 ? 'Free' : formatINR(199)}`} />
                <FormControlLabel value="express" control={<Radio />} label={`Express (1-2 days) · ${formatINR(499)}`} />
              </RadioGroup>
            </FormControl>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Billing address</Typography>
              <FormControlLabel control={<Checkbox checked={billingSame} onChange={e => setBillingSame(e.target.checked)} />} label="Same as shipping" />
            </Box>
            {!billingSame && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField id="billingAddress1" label="Address line 1" fullWidth value={billing.address1} onChange={e => { setBilling(v => ({ ...v, address1: e.target.value })); clearFieldError('billingAddress1', e.target.value); }} error={!!fieldErrors.billingAddress1} helperText={fieldErrors.billingAddress1} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Address line 2 (optional)" fullWidth value={billing.address2} onChange={e => setBilling(v => ({ ...v, address2: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="billingCity"
                    label="City"
                    fullWidth
                    value={billing.city}
                    onChange={e => { setBilling(v => ({ ...v, city: e.target.value.replace(/\d/g, '') })); clearFieldError('billingCity', e.target.value); }}
                    onBlur={() => { const v = (billing.city || '').trim(); if (!validateNotEmpty(v)) setFieldError('billingCity', 'City required.'); else if (/\d/.test(v)) setFieldError('billingCity', 'City cannot contain numbers.'); else clearFieldError('billingCity', v); }}
                    error={!!fieldErrors.billingCity}
                    helperText={fieldErrors.billingCity}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    id="billingState"
                    label="State"
                    fullWidth
                    value={billing.state}
                    onChange={e => { setBilling(v => ({ ...v, state: e.target.value.replace(/\d/g, '') })); clearFieldError('billingState', e.target.value); }}
                    onBlur={() => { const v = (billing.state || '').trim(); if (!validateNotEmpty(v)) setFieldError('billingState', 'State required.'); else if (/\d/.test(v)) setFieldError('billingState', 'State cannot contain numbers.'); else clearFieldError('billingState', v); }}
                    error={!!fieldErrors.billingState}
                    helperText={fieldErrors.billingState}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    id="billingPostalCode"
                    label="Postal code"
                    fullWidth
                    value={billing.postalCode}
                    onChange={e => { handlePostalChange(e.target.value, 'billing'); }}
                    onBlur={() => { if (!validatePostalCode(billing.postalCode)) setFieldError('billingPostalCode', 'Valid postal code required.'); else clearFieldError('billingPostalCode', billing.postalCode); }}
                    error={!!fieldErrors.billingPostalCode}
                    helperText={fieldErrors.billingPostalCode}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Country"
                    fullWidth
                    value={billing.country}
                    onChange={e => setBilling(v => ({ ...v, country: e.target.value.replace(/\d/g, '') }))}
                    onBlur={() => { const v = (billing.country || '').trim(); if (!validateNotEmpty(v)) setFieldError('billingCountry', 'Country required.'); else if (/\d/.test(v)) setFieldError('billingCountry', 'Country cannot contain numbers.'); else clearFieldError('billingCountry', v); }}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Payment</Typography>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Method</FormLabel>
              <RadioGroup row value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <FormControlLabel value="card" control={<Radio />} label="Card" />
                <FormControlLabel value="upi" control={<Radio />} label="UPI" />
                <FormControlLabel value="cod" control={<Radio />} label={`Cash on Delivery ${formatINR(49)}`} />
              </RadioGroup>
            </FormControl>

            {paymentMethod === 'card' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField id="nameOnCard" label="Name on card" fullWidth value={card.name} onChange={e => { setCard(v => ({ ...v, name: e.target.value })); clearFieldError('nameOnCard', e.target.value); }} error={!!fieldErrors.nameOnCard} helperText={fieldErrors.nameOnCard} />
                </Grid>
                <Grid item xs={12}>
                  <TextField id="cardNumber" label="Card number" fullWidth value={card.number} onChange={e => { setCard(v => ({ ...v, number: e.target.value })); clearFieldError('cardNumber', e.target.value); }} placeholder="1234 5678 9012 3456" error={!!fieldErrors.cardNumber} helperText={fieldErrors.cardNumber} />
                </Grid>
                <Grid item xs={6}>
                  <TextField id="expiry" label="Expiry (MM/YY)" fullWidth value={card.exp} onChange={e => { setCard(v => ({ ...v, exp: e.target.value })); clearFieldError('expiry', e.target.value); }} error={!!fieldErrors.expiry} helperText={fieldErrors.expiry} />
                </Grid>
                <Grid item xs={6}>
                  <TextField id="cvv" label="CVV" fullWidth value={card.cvv} onChange={e => { setCard(v => ({ ...v, cvv: e.target.value })); clearFieldError('cvv', e.target.value); }} error={!!fieldErrors.cvv} helperText={fieldErrors.cvv} />
                </Grid>
              </Grid>
            )}
            {paymentMethod === 'upi' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField id="upiId" label="UPI ID" fullWidth value={upi.id} onChange={e => { setUpi({ id: e.target.value }); clearFieldError('upiId', e.target.value); }} placeholder="name@bank" error={!!fieldErrors.upiId} helperText={fieldErrors.upiId} />
                </Grid>
              </Grid>
            )}
          </Paper>

          {/* Promo code section removed */}
            {error && (
            <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
          )}
          <FormControlLabel
            control={<Checkbox id="agree" checked={agree} onChange={e => setAgree(e.target.checked)} />}
            label="I agree to the Terms and Conditions"
          />

          <Button variant="contained" size="large" onClick={handlePlaceOrder} sx={{ mt: 2 }}>
            Place Order
          </Button>
        </Grid>

        {/* Right: Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 'var(--appbar-height, 72px)', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Order Summary</Typography>
            <Stack spacing={1}>
              {checkoutItems.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.title} × {item.quantity}
                  </Typography>
                  <Typography variant="body2">{formatINR(item.price * item.quantity * 83)}</Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>{formatINR(subtotalINR)}</Typography>
            </Box>
            {/* Discount row removed (promo code) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping</Typography>
              <Typography>{shippingFeeINR === 0 ? 'Free' : formatINR(shippingFeeINR)}</Typography>
            </Box>
            {paymentMethod === 'cod' && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>COD fee</Typography>
                <Typography>{formatINR(codFeeINR)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (8%)</Typography>
              <Typography>{formatINR(taxINR)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatINR(grandTotalINR)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </PageTransition>
  );
};

export default CheckoutPage;
