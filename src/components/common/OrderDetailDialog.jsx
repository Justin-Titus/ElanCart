import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider, Stack } from '@mui/material';

const OrderDetailDialog = ({ open, onClose, order }) => {
  if (!order) return null;
  const fmt = (v) => (typeof v === 'number' ? `₹${v.toFixed(2)}` : 'N/A');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Order Details #{order.id}</DialogTitle>
      <Divider />
      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Placed on: {new Date(order.date).toLocaleString()}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 1 }}>Items</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {order.items.map(item => (
            <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{item.title} × {item.quantity}</Typography>
              <Typography variant="body2" color="text.secondary">{fmt(item.price * item.quantity * 83)}</Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">{fmt(order.amounts?.subtotalINR)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="body2">{fmt(order.amounts?.shippingINR)}</Typography>
          </Stack>
          {order.amounts?.codFeeINR ? (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">COD Fee</Typography>
              <Typography variant="body2">{fmt(order.amounts.codFeeINR)}</Typography>
            </Stack>
          ) : null}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Tax</Typography>
            <Typography variant="body2">{fmt(order.amounts?.taxINR)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{fmt(order.amounts?.totalINR)}</Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          <b>Shipping Address:</b> {order.shipping?.addressFormatted || 'N/A'}
        </Typography>
        {order.billing?.addressFormatted && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <b>Billing Address:</b> {order.billing.addressFormatted}
          </Typography>
        )}
        {order.paymentMethod && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <b>Payment Method:</b> {order.paymentMethod.toUpperCase()}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog;
