import React, { useState } from 'react';
import PageTransition from '../components/common/PageTransition';
import { Box, Paper, Typography, Avatar, Button, Divider, Stack, IconButton, TextField, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CardActions, useTheme, useMediaQuery } from '@mui/material';
import OrderDetailDialog from '../components/common/OrderDetailDialog';
import { useUser } from '../contexts/useUser';
import { useNavigate } from 'react-router-dom';
import EditAddressDialog from '../components/common/EditAddressDialog';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const ProfilePage = () => {

  const { user, logout, updateUser } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  

  if (!user) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>You are not logged in.</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>Login / Signup</Button>
      </Box>
    );
  }

  // Calculate order stats
  const totalOrders = user.orders?.length || 0;
  const totalSpent = user.orders?.reduce((sum, order) => sum + (order.amounts?.totalINR || 0), 0) || 0;

  return (
    <PageTransition>
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: {sm:1, md:2}, px: 2 }}>
      {/* Header Section - Formal Card */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar sx={{ width: 88, height: 88, fontSize: 36, bgcolor: 'primary.main', color: 'white' }}>
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            {editName ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                  size="medium"
                  variant="standard"
                  autoFocus
                  placeholder="Your name"
                  error={!!nameError}
                  helperText={nameError}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = nameInput.trim();
                      if (val.length < 2) { setNameError('Name must be at least 2 characters'); return; }
                      updateUser({ name: val }); setEditName(false);
                    }
                    if (e.key === 'Escape') {
                      setNameInput(user?.name || ''); setNameError(''); setEditName(false);
                    }
                  }}
                  InputProps={{ style: { color: 'inherit', fontSize: '1.25rem', fontWeight: 700 } }}
                  sx={{ minWidth: 200 }}
                />
                <IconButton size="small" onClick={() => {
                  const val = nameInput.trim();
                  if (val.length < 2) { setNameError('Name must be at least 2 characters'); return; }
                  updateUser({ name: val }); setEditName(false);
                }} color="primary">
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => { setNameInput(user?.name || ''); setNameError(''); setEditName(false); }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name || 'Click to add name'}</Typography>
                <IconButton size="small" onClick={() => setEditName(true)} sx={{ color: 'text.secondary' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{user.email}</Typography>
            {/* Phone is now part of the shipping address editor and shown below in the address box */}
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Chip label={`${totalOrders} Orders`} icon={<ShoppingBagOutlinedIcon />} variant="outlined" sx={{ fontWeight: 600 }} />
              <Chip label={`₹${totalSpent.toFixed(2)} Spent`} variant="outlined" sx={{ fontWeight: 600 }} />
            </Stack>
          </Box>
          <Button variant="contained" color="error" onClick={logout} sx={{ px: 3 }}>Logout</Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Shipping Address Section */}
        <Grid item xs={12} md={5}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <LocationOnOutlinedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>Shipping Address</Typography>
              <IconButton size="small" onClick={() => setEditAddressOpen(true)} sx={{ color: 'primary.main' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box sx={{ bgcolor: '#f8f9fa', p: 2.5, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {user.address || (
                  <span style={{ fontStyle: 'italic', color: '#999' }}>
                    No address saved. Click the edit icon to add your shipping address.
                  </span>
                )}
              </Typography>
              {/* Show phone inside address area when available */}
              {user.phone && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  <PhoneIcon sx={{ verticalAlign: 'middle', color: 'primary.main', mr: 0.6 }} /> {user.phone}
                </Typography>
              )}
            </Box>
            <EditAddressDialog
              open={editAddressOpen}
              onClose={() => setEditAddressOpen(false)}
              initialAddress={user.address}
              initialPhone={user.phone}
              onSave={(addr, phone) => updateUser({ address: addr, phone: phone || '' })}
            />
          </Paper>
        </Grid>

        {/* Quick Stats Section */}
        <Grid item xs={12} md={7}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PersonOutlineIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Account Overview</Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  p: 2.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 180ms, box-shadow 180ms, border-color 180ms',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6, borderColor: 'primary.dark' }
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalOrders}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>Total Orders</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  p: 2.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 180ms, box-shadow 180ms, border-color 180ms',
                  border: '1px solid',
                  borderColor: 'success.main',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6, borderColor: 'success.dark' }
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{totalSpent.toFixed(0)}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>Total Spent</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  p: 2.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 180ms, box-shadow 180ms, border-color 180ms',
                  border: '1px solid',
                  borderColor: 'error.main',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6, borderColor: 'error.dark' }
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalOrders > 0 ? `₹${(totalSpent / totalOrders).toFixed(0)}` : '₹0'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>Avg. Order Value</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  p: 2.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 180ms, box-shadow 180ms, border-color 180ms',
                  border: '1px solid',
                  borderColor: 'warning.main',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6, borderColor: 'warning.dark' }
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {user.orders?.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0), 0) || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>Items Purchased</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Order History Section */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <ReceiptLongOutlinedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Order History</Typography>
            </Stack>
            {user.orders && user.orders.length > 0 ? (
              isMdUp ? (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table sx={{ minWidth: 650 }} aria-label="order history table">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Order #</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Items</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {user.orders.slice().reverse().map((order) => (
                        <TableRow
                          key={order.id}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                              cursor: 'pointer'
                            },
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                            #{order.id}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <Box>
                              {order.items.slice(0, 2).map(item => (
                                <Typography key={item.id} variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
                                  {item.title} × {item.quantity}
                                </Typography>
                              ))}
                              {order.items.length > 2 && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                  +{order.items.length - 2} more items
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                            ₹{order.amounts?.totalINR ? order.amounts.totalINR.toFixed(2) : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setOrderDetailOpen(true);
                              }}
                              sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2,
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                  color: 'white'
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box>
                  {user.orders.slice().reverse().map(order => (
                    <Paper key={order.id} elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} onClick={() => { setSelectedOrder(order); setOrderDetailOpen(true); }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>#{order.id}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                      </Stack>
                      <Box sx={{ mb: 1 }}>
                        {order.items.slice(0, 3).map(item => (
                          <Typography key={item.id} variant="body2" sx={{ color: 'text.primary' }}>{item.title} × {item.quantity}</Typography>
                        ))}
                        {order.items.length > 3 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>+{order.items.length - 3} more items</Typography>
                        )}
                      </Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700 }}>₹{order.amounts?.totalINR ? order.amounts.totalINR.toFixed(2) : 'N/A'}</Typography>
                        <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setOrderDetailOpen(true); }} sx={{ textTransform: 'none' }}>View Details</Button>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              )
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No orders yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start shopping to see your order history here
                </Typography>
                <Button variant="contained" onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              </Box>
            )}
            <OrderDetailDialog open={orderDetailOpen} onClose={() => setOrderDetailOpen(false)} order={selectedOrder} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </PageTransition>
  );
};

export default ProfilePage;