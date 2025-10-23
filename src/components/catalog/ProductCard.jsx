import React, { memo } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Rating,
  IconButton
} from '@mui/material';
import {
  AddShoppingCart,
  Remove,
  Add,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavourites } from '../../contexts/FavouritesContext';

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItem, updateCartItemQuantity, removeFromCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  
  const cartItem = getCartItem(product.id);
  const inCart = isInCart(product.id);
  const isFav = isFavourite(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuantityChange = (e, newQuantity) => {
    e.stopPropagation();
    if (newQuantity === 0) {
      removeFromCart(product.id);
    } else {
      updateCartItemQuantity(product.id, newQuantity);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleToggleFavourite = (e) => {
    e.stopPropagation();
    toggleFavourite(product);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          sx={{
            height: 200,
            objectFit: 'contain',
            p: 2,
          }}
          image={product.image}
          alt={product.title}
        />
        <IconButton
          onClick={handleToggleFavourite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
          size="small"
        >
          {isFav ? (
            <Favorite sx={{ color: 'secondary.main' }} />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          gutterBottom
          variant="body2"
          color="text.secondary"
          sx={{ textTransform: 'capitalize', mb: 1 }}
        >
          {product.category}
        </Typography>
        
        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.4,
            height: '3.8em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <Rating
            value={product.rating}
            precision={0.1}
            size="small"
            readOnly
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product.ratingCount})
          </Typography>
        </Box>
        
        <Typography
          variant="h5"
          color="primary"
          sx={{ fontWeight: 'bold', mt: 'auto' }}
        >
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        {!inCart ? (
          <Button
            variant="contained"
            startIcon={<AddShoppingCart />}
            onClick={handleAddToCart}
            fullWidth
          >
            Add to Cart
          </Button>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => handleQuantityChange(e, cartItem.quantity - 1)}
            >
              <Remove />
            </Button>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold'
              }}
            >
              {cartItem.quantity}
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => handleQuantityChange(e, cartItem.quantity + 1)}
            >
              <Add />
            </Button>
          </Box>
        )}
      </CardActions>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
