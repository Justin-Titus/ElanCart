import React, { memo, useCallback, useRef, useEffect } from 'react';
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
import useInView from '../../hooks/useInView';

const ProductCard = memo(({ product, viewMode = 'grid', disableAnimation = false, eagerLoad = false, index = 0 }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItem } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  
  const cartItem = getCartItem(product.id);
  const inCart = isInCart(product.id);
  const isFav = isFavourite(product.id);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    addToCart(product, 1);
  }, [addToCart, product]);

  const handleCardClick = useCallback(() => {
    navigate(`/product/${product.id}`);
  }, [navigate, product.id]);

  const handleToggleFavourite = useCallback((e) => {
    e.stopPropagation();
    toggleFavourite(product);
  }, [toggleFavourite, product]);

  // Defensive fallback for missing product data
  const safeImage = product.image || product.thumbnail || 'https://via.placeholder.com/220x220?text=No+Image';
  const safeTitle = product.title || product.name || 'Untitled Product';
  const safeRating = typeof product.rating === 'number' ? product.rating : 0;
  const safeRatingCount = typeof product.ratingCount === 'number' ? product.ratingCount : 0;
  const safePrice = typeof product.price === 'number' ? product.price : 0;

  const cardContent = (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: viewMode === 'list' ? 'row' : 'column',
        backgroundColor: 'background.paper',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'visible',
        '&:hover .product-image': {
          transform: 'scale(1.07)'
        },
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        }
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ 
        position: 'relative',
        width: viewMode === 'list' ? { xs: '100%', sm: 200 } : '100%',
        flexShrink: 0,
        overflow: 'hidden' // Prevent image from overflowing card on zoom
      }}>
        <CardMedia
          component="img"
          className="product-image"
          sx={{
            height: viewMode === 'list' ? { xs: 150, sm: 200 } : 220,
            objectFit: 'contain',
            p: 2,
            backgroundColor: 'grey.50',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
          image={safeImage}
          alt={safeTitle}
          loading={eagerLoad ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eagerLoad ? 'high' : 'low'}
        />
        <IconButton
          onClick={handleToggleFavourite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.15)',
            }
          }}
          size="small"
        >
          {isFav ? (
            <Favorite sx={{ color: 'error.main', fontSize: 20 }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Box>
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}>
        <Typography
          variant="h6"
          component="h4"
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            fontSize: '0.95rem',
            height: viewMode === 'list' ? 'auto' : '2.6em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: viewMode === 'list' ? 2 : 2,
            WebkitBoxOrient: 'vertical',
            color: 'text.primary'
          }}
        >
          {safeTitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'space-between' }}>
          <Box> <Rating
            value={safeRating}
            precision={0.1}
            size="small"
            readOnly
            sx={{ fontSize: '1rem' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 600 }}>
            ({safeRatingCount})
          </Typography>
        </Box>
        {/* Stock availability */}
        <Box>
        <Typography
          variant="caption" 
          sx={{ 
            mb: 0.5,
            color: product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main',
            fontWeight: 600,
          }}
        >
          {product.stock > 10 ? `In Stock (${product.stock})` : 
           product.stock > 0 ? `Only ${product.stock} left!` : 
           'Out of Stock'}
        </Typography>
        </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, justifyContent: 'space-between' }}>
          <Box>
        <Typography
          variant="h5"
          color="primary"
          sx={{ fontWeight: 800, fontSize: '1.4rem' }}
        >
          ₹{(safePrice * 83).toFixed(2)}
        </Typography></Box>
        <Box>
          {inCart && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                textAlign: 'center',
                mb: 0.5,
                color: 'gray',
                fontWeight: 600
              }}
            >
              {cartItem.quantity} in cart
            </Typography>
          )}
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ width: '100%', mx: 2 }}>
          
          <Button
            variant="contained"
            startIcon={<AddShoppingCart />}
            onClick={handleAddToCart}
            fullWidth
            disabled={!product.stock || product.stock < 1}
            sx={{
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </CardActions>
    </Card>
  );

  // Use the project's useInView hook to animate when card enters viewport (10% visibility)
  const [ref, inView] = useInView({ threshold: 0.1 });
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (inView) hasAnimatedRef.current = true;
  }, [inView]);

  // Stagger delay per-card to create a cascading entrance
  const delayMs = Math.min(index * 40, 300); // cap at 300ms

  const visible = disableAnimation ? true : (inView || hasAnimatedRef.current);

  const wrapperStyle = {
    height: '100%',
    opacity: visible ? 1 : 0,
    transform: disableAnimation ? 'none' : visible ? 'translateY(0px) scale(1)' : 'translateY(10px) scale(0.995)',
    transition: disableAnimation ? 'none' : `opacity 380ms cubic-bezier(0.2,0,0,1) ${delayMs}ms, transform 420ms cubic-bezier(0.2,0,0,1) ${delayMs}ms, box-shadow 200ms ${delayMs}ms`,
    willChange: 'opacity, transform'
  };

  return (
    <div ref={ref} style={wrapperStyle}>
      {cardContent}
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
