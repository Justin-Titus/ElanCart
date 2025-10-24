import React, { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import SplitText from "../components/common/SplitText";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Rating,
  Chip,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  AddShoppingCart,
  Remove,
  Add,
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Share,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { useFavourites } from "../contexts/FavouritesContext";
import { useBuyNow } from "../hooks/useBuyNow";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, loading } = useProducts();
  const {
    addToCart,
    isInCart,
    getCartItem,
    updateCartItemQuantity,
    removeFromCart,
  } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  const { storeBuyNowData } = useBuyNow();

  // Derive product from products + id so there's no intermediate render where product is null
  const product = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return null;
    // Product IDs can be strings (e.g., 'fs-1', 'dj-5') after merging sources — compare as strings
    let found = products.find((p) => String(p.id) === String(id));
    if (!found) {
      // Try numeric fallback: match trailing number in id or parseInt compare
      const numericId = Number(id);
      if (!Number.isNaN(numericId)) {
        found = products.find((p) => {
          const trailing = String(p.id).match(/(\d+)$/);
          return trailing
            ? Number(trailing[1]) === numericId
            : Number(p.id) === numericId;
        });
      }
    }
    return found || null;
  }, [id, products]);
  const [buyNowDialogOpen, setBuyNowDialogOpen] = useState(false);
  const [buyNowQty, setBuyNowQty] = useState(1);
  const [copySnackOpen, setCopySnackOpen] = useState(false);

  // Handle Buy Now button click - open dialog
  const handleBuyNowClick = () => {
    setBuyNowQty(1); // Reset to 1
    setBuyNowDialogOpen(true);
  };

  // Handle Buy Now confirmation - proceed to checkout
  const handleBuyNowConfirm = () => {
    if (!product || buyNowQty < 1) return;
    setBuyNowDialogOpen(false);

    // Prepare buyNow data
    const buyNowData = {
      buyNow: true,
      items: [
        {
          ...product,
          quantity: buyNowQty,
        },
      ],
    };

    // Always store buyNow data before navigation (for login redirect scenarios)
    storeBuyNowData(buyNowData);

    // Go to checkout - if user is not authenticated, ProtectedRoute will handle the redirect
    navigate("/checkout", {
      state: buyNowData,
    });
  };

  // Only query cart/favourites when we have a resolved product id to avoid transient mismatches
  const cartItem = product ? getCartItem(product.id) : null;
  const inCart = product ? isInCart(product.id) : false;

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock && product.stock < 1) return;
    addToCart(product, 1);
  };

  // Update cart item quantity handler
  const handleUpdateCart = (newQuantity) => {
    if (!product) return;
    if (newQuantity === 0) {
      removeFromCart(product.id);
    } else {
      updateCartItemQuantity(product.id, newQuantity);
    }
  };

  // Back button handler
  const handleBack = () => {
    navigate(-1);
  };

  // Favourite handler
  const handleToggleFavourite = () => {
    if (!product) return;
    toggleFavourite(product);
  };

  // Share handler
  const handleShare = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Use a non-blocking UI message instead of alert for production
      try {
        setCopySnackOpen(true);
      } catch {
        // fallback for environments without React UI (rare)
        // no-op
      }
    }
  };

  // Favourite status
  const favourite = product ? isFavourite(product.id) : false;

  // While products are loading, show a centered spinner instead of a transient 'Product not found'
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </motion.div>
    );
  }

  // If loading has finished and still no product found, show friendly message
  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Product not found
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={handleBack}>
            Go Back
          </Button>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
  <Box>
        {/* Breadcrumbs */}
        {/* <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ textDecoration: 'none' }}
        >
          Home
        </Link>
        <Typography color="text.primary" sx={{ textTransform: 'capitalize' }}>
          {product.category}
        </Typography>
        <Typography color="text.primary">
          {product.title.length > 30 ? `${product.title.substring(0, 30)}...` : product.title}
        </Typography>
      </Breadcrumbs> */}

        {/* Back button */}
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 3 }}>
          Back to Products
        </Button>

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                minHeight: { xs: 180, md: 300 },
                position: "sticky",
                top: { xs: 70, md: 80 },
                zIndex: 10,
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                style={{
                  maxWidth: "60%", // reduced by 40%
                  maxHeight: "60%", // reduced by 40%
                  objectFit: "contain",
                }}
              />
            </Paper>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "sticky", top: 20 }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {/* Title */}
                <SplitText
                  text={product.title}
                  tag="h1"
                  className="product-title"
                  delay={50}
                  duration={0.5}
                  splitType="words"
                />

                {/* Category */}
                <Chip
                  label={product.category}
                  variant="outlined"
                  sx={{ textTransform: "capitalize", alignSelf: "flex-end" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Price */}
                <Box>
                  <Typography
                    variant="h3"
                    color="primary"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    ₹{(product.price * 83).toFixed(2)}
                  </Typography>
                </Box>
                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Rating value={product.rating} precision={0.1} readOnly />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({product.ratingCount} reviews)
                  </Typography>
                </Box>
              </Box>
              {/* Stock availability */}
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  color:
                    product.stock > 10
                      ? "success.main"
                      : product.stock > 0
                      ? "warning.main"
                      : "error.main",
                  fontWeight: 500,
                }}
              >
                {product.stock > 10
                  ? `In Stock (${product.stock} available)`
                  : product.stock > 0
                  ? `Only ${product.stock} left in stock`
                  : "Out of Stock"}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.7 }}
              >
                {product.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Actions */}
              <Box sx={{ mb: 3 }}>
                {/* Buy Now and Add to Cart section */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    color="success"
                    fullWidth
                    onClick={handleBuyNowClick}
                    sx={{ fontWeight: 700 }}
                  >
                    Buy Now 
                  </Button>
                  {!inCart && (
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<AddShoppingCart />}
                      onClick={handleAddToCart}
                      sx={{ fontWeight: 700 }}
                    >
                      Add to Cart
                    </Button>
                  )}
                </Box>
                {/* If in cart, show update quantity and view cart */}
                {inCart && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        Update quantity:
                      </Typography>
                      <IconButton
                        onClick={() => handleUpdateCart(cartItem.quantity - 1)}
                        color="primary"
                      >
                        <Remove />
                      </IconButton>
                      <Typography
                        variant="h6"
                        sx={{
                          mx: 2,
                          minWidth: "40px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {cartItem.quantity}
                      </Typography>
                      <IconButton
                        onClick={() => handleUpdateCart(cartItem.quantity + 1)}
                        color="primary"
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={() => navigate("/cart")}
                      sx={{ mb: 2 }}
                    >
                      View Cart
                    </Button>
                  </Box>
                )}
                {/* Secondary actions */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={favourite ? <Favorite /> : <FavoriteBorder />}
                    onClick={handleToggleFavourite}
                    color={favourite ? "error" : "primary"}
                    sx={{ flex: 1 }}
                  >
                    {favourite ? "Favorited" : "Add to Favorites"}
                  </Button>
                  <IconButton
                    onClick={handleShare}
                    color="primary"
                    sx={{ border: 1, borderColor: "primary.main" }}
                  >
                    <Share />
                  </IconButton>
                </Box>
              </Box>

              {/* Product Info */}
              <Paper
                variant="outlined"
                sx={{ p: 2, backgroundColor: "grey.50" }}
              >
                <Typography variant="body2" color="text.secondary">
                  • Free shipping on orders over ₹4,150
                  <br />
                  • 30-day return policy
                  <br />
                  • Secure payment processing
                  <br />• Customer support available 24/7
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Buy Now Dialog */}
        <Dialog
          open={buyNowDialogOpen}
          onClose={() => setBuyNowDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{ pb: 0.5, pt: 2, fontWeight: 700, fontSize: "1.5rem" }}
          >
            Buy Now
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {/* Product Info */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                p: 1.5,
                backgroundColor: "#f8fafc",
                borderRadius: 2,
              }}
            >
              <Box
                component="img"
                src={product?.image}
                alt={product?.title}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  p: 1,
                  border: "1px solid #e0e0e0",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product?.title}
                </Typography>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  ₹{((product?.price || 0) * 83).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {product?.stock > 10
                    ? `${product?.stock} in stock`
                    : product?.stock > 0
                    ? `Only ${product?.stock} left!`
                    : "Out of stock"}
                </Typography>
              </Box>
            </Box>

            {/* Quantity Selector */}
            <Box sx={{ py: 1.5 }}>
              <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Select Quantity
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: "center",
                }}
              >
                <IconButton
                  onClick={() => setBuyNowQty((q) => Math.max(1, q - 1))}
                  disabled={buyNowQty <= 1}
                  color="primary"
                  size="small"
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    minWidth: 50,
                    textAlign: "center",
                    py: 0.5,
                    px: 2,
                    border: 2,
                    borderColor: "primary.main",
                    borderRadius: 1.5,
                    backgroundColor: "primary.50",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {buyNowQty}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() =>
                    setBuyNowQty((q) => Math.min(product?.stock || 999, q + 1))
                  }
                  disabled={buyNowQty >= (product?.stock || 999)}
                  color="primary"
                  size="small"
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Order Summary */}
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: "#f0f4ff",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Price per item:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₹{((product?.price || 0) * 83).toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Quantity:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {buyNowQty}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Total:
                </Typography>
                <Typography
                  variant="h6"
                  color="success.main"
                  sx={{ fontWeight: 700 }}
                >
                  ₹{((product?.price || 0) * 83 * buyNowQty).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={() => setBuyNowDialogOpen(false)}
              color="inherit"
              size="large"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBuyNowConfirm}
              variant="contained"
              color="success"
              size="large"
              sx={{ px: 4, fontWeight: 700 }}
              disabled={!product?.stock || product.stock < 1}
            >
              Proceed to Checkout
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={copySnackOpen} autoHideDuration={3000} onClose={() => setCopySnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setCopySnackOpen(false)} severity="success" sx={{ width: '100%' }}>Product link copied to clipboard!</Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
};

export default ProductDetailPage;
