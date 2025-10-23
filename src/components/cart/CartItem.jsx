import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Remove,
  Delete
} from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';

const CartItem = ({ item }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { updateCartItemQuantity, removeFromCart } = useCart();

  const handleNavigateToProduct = () => {
    navigate(`/product/${item.id}`);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.id);
    } else {
      updateCartItemQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const itemTotal = (item.price * item.quantity * 83).toFixed(2);

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CardMedia
            component="img"
            sx={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            image={item.image}
            alt={item.title}
            onClick={handleNavigateToProduct}
          />
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              onClick={handleNavigateToProduct}
              sx={{
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              {item.title}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ₹{(item.price * 83).toFixed(2)} each
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  color="primary"
                >
                  <Remove />
                </IconButton>
                
                <Typography
                  variant="body1"
                  sx={{
                    mx: 2,
                    minWidth: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {item.quantity}
                </Typography>
                
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  color="primary"
                >
                  <Add />
                </IconButton>
              </Box>
              
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                ₹{itemTotal}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<Delete />}
                onClick={handleRemove}
                color="error"
              >
                Remove
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card sx={{ mb: 2 }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
        <CardMedia
          component="img"
          sx={{
            width: 120,
            height: 120,
            objectFit: 'contain',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
          image={item.image}
          alt={item.title}
          onClick={handleNavigateToProduct}
        />
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            onClick={handleNavigateToProduct}
            sx={{
              fontWeight: 600,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline'
              }
            }}
          >
            {item.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            ₹{(item.price * 83).toFixed(2)} each
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => handleQuantityChange(item.quantity - 1)}
                color="primary"
              >
                <Remove />
              </IconButton>
              
              <Typography
                variant="h6"
                sx={{
                  mx: 3,
                  minWidth: '30px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                {item.quantity}
              </Typography>
              
              <IconButton
                onClick={() => handleQuantityChange(item.quantity + 1)}
                color="primary"
              >
                <Add />
              </IconButton>
            </Box>
            
            <Button
              startIcon={<Delete />}
              onClick={handleRemove}
              color="error"
              sx={{ ml: 2 }}
            >
              Remove
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
            ₹{itemTotal}
          </Typography>
        </Box>
      </Box>
    </Card>
    </motion.div>
  );
};

export default CartItem;