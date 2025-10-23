import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';

const EditAddressDialog = ({ open, onClose, initialAddress, initialPhone, onSave }) => {
  const [addressData, setAddressData] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Parse initial address string into fields when dialog opens
  useEffect(() => {
    if (open) {
      setPhone(initialPhone || '');
    }
    if (open && initialAddress) {
      // Try to parse the address string
      // Format: "address1, address2, city, state postalCode, country"
      const parts = initialAddress.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const address1 = parts[0] || '';
        const address2 = parts.length > 3 ? parts[1] : '';
        const city = parts.length > 3 ? parts[2] : parts[1] || '';
        const statePostal = parts.length > 3 ? parts[3] : parts[2] || '';
        const country = parts.length > 3 ? (parts[4] || 'India') : (parts[3] || 'India');
        
        const statePostalParts = statePostal.split(' ').filter(p => p);
        const state = statePostalParts.slice(0, -1).join(' ') || '';
        const postalCode = statePostalParts[statePostalParts.length - 1] || '';

        setAddressData({
          address1,
          address2,
          city,
          state,
          postalCode,
          country
        });
      }
    } else if (open) {
      // Reset to default for new address
      setAddressData({
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      });
    }
    setErrors({});
  }, [open, initialAddress, initialPhone]);

  // Validation helpers
  const validateNotEmpty = val => val && val.trim().length > 0;
  const validatePostalCode = code => /^\d{5,6}$/.test(code);

  const setFieldError = (field, msg) => {
    setErrors(prev => ({ ...prev, [field]: msg }));
  };

  const clearFieldError = (field) => {
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateAll = () => {
    const newErrors = {};
    if (!validateNotEmpty(addressData.address1)) newErrors.address1 = 'Address line 1 required.';
    if (!validateNotEmpty(addressData.city)) newErrors.city = 'City required.';
    if (!validateNotEmpty(addressData.state)) newErrors.state = 'State required.';
    if (!validatePostalCode(addressData.postalCode)) newErrors.postalCode = 'Valid postal code required.';
    if (phone && !/^\d{10}$/.test(phone)) newErrors.phone = 'Enter a valid 10-digit phone.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateAll()) return;
    
    // Format address as string for storage
    const formattedAddress = `${addressData.address1}${addressData.address2 ? ', ' + addressData.address2 : ''}, ${addressData.city}, ${addressData.state} ${addressData.postalCode}, ${addressData.country}`;
    onSave(formattedAddress, phone);
    onClose();
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Shipping Address</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Address line 1"
              required
              fullWidth
              value={addressData.address1}
              onChange={e => setAddressData(v => ({ ...v, address1: e.target.value }))}
              error={!!errors.address1}
              helperText={errors.address1}
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address line 2 (optional)"
              fullWidth
              value={addressData.address2}
              onChange={e => setAddressData(v => ({ ...v, address2: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              required
              fullWidth
              value={addressData.city}
              onChange={e => setAddressData(v => ({ ...v, city: e.target.value.replace(/\d/g, '') }))}
              onBlur={() => {
                const v = (addressData.city || '').trim();
                if (!validateNotEmpty(v)) setFieldError('city', 'City required.');
                else if (/\d/.test(v)) setFieldError('city', 'City cannot contain numbers.');
                else clearFieldError('city');
              }}
              error={!!errors.city}
              helperText={errors.city}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="State"
              required
              fullWidth
              value={addressData.state}
              onChange={e => setAddressData(v => ({ ...v, state: e.target.value.replace(/\d/g, '') }))}
              onBlur={() => {
                const v = (addressData.state || '').trim();
                if (!validateNotEmpty(v)) setFieldError('state', 'State required.');
                else if (/\d/.test(v)) setFieldError('state', 'State cannot contain numbers.');
                else clearFieldError('state');
              }}
              error={!!errors.state}
              helperText={errors.state}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Postal code"
              required
              fullWidth
              value={addressData.postalCode}
              onChange={e => setAddressData(v => ({ ...v, postalCode: e.target.value.replace(/\D/g, '') }))}
              onBlur={() => {
                if (!validatePostalCode(addressData.postalCode)) setFieldError('postalCode', 'Valid postal code required.'); else clearFieldError('postalCode');
              }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              error={!!errors.postalCode}
              helperText={errors.postalCode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Country"
              fullWidth
              value={addressData.country}
              onChange={e => setAddressData(v => ({ ...v, country: e.target.value.replace(/\d/g, '') }))}
              onBlur={() => {
                const v = (addressData.country || '').trim();
                if (!validateNotEmpty(v)) setFieldError('country', 'Country required.');
                else if (/\d/.test(v)) setFieldError('country', 'Country cannot contain numbers.');
                else clearFieldError('country');
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone (optional)"
              fullWidth
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => {
                if (phone && !/^\d{10}$/.test(phone)) setFieldError('phone', 'Enter a valid 10-digit phone.'); else clearFieldError('phone');
              }}
              inputProps={{ inputMode: 'tel', pattern: '[0-9]*' }}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="10-digit phone"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAddressDialog;
