import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Container
} from '@mui/material';
import {
  FavoriteBorder,
  ShoppingCart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavourites } from '../contexts/FavouritesContext';
import ProductCard from '../components/products/ProductCardItem';

const FavouritesPage = () => {
  const navigate = useNavigate();
  const { favouritesState, clearFavourites } = useFavourites();

  const handleClearFavourites = () => {
    if (window.confirm('Are you sure you want to clear all favourites?')) {
      clearFavourites();
    }
  };

  if (favouritesState.items.length === 0) {
    return (
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'background.default'
          }}
        >
          <FavoriteBorder
            sx={{
              fontSize: 80,
              color: 'text.secondary',
              mb: 2
            }}
          />
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Your Favourites is Empty
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 3 }}
          >
            You haven't added any products to your favourites yet.
            Start exploring and save your favorite items!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            My Favourites
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {favouritesState.items.length} {favouritesState.items.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="error"
          onClick={handleClearFavourites}
        >
          Clear All Favourites
        </Button>
      </Box>

      <Grid container spacing={2}>
        {favouritesState.items.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <ProductCard product={product} disableAnimation eagerLoad />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
    </motion.div>
  );
};

export default FavouritesPage;
