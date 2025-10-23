import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Alert,
  Skeleton
} from '@mui/material';
import { useTheme, useMediaQuery, Paper } from '@mui/material';
import { GridView, ViewList } from '@mui/icons-material';
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from '@mui/icons-material';
import ProductCard from './ProductCardItem';
import { useProducts } from '../../contexts/ProductContext';

const ProductSkeleton = memo(() => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Box sx={{ p: 1 }}>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={32} width="40%" />
    </Box>
  </Grid>
));

const ProductGrid = memo((props) => {
  const { onNavigateToProducts } = props || {};
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    loading,
    error,
    currentPage,
    setCurrentPage,
    getPaginatedProducts
  } = useProducts();

  const paginatedData = useMemo(() => {
    try {
      return getPaginatedProducts();
    } catch (err) {
      console.error('Error calling getPaginatedProducts in ProductGrid:', err);
      return { products: [], totalProducts: 0, totalPages: 0 };
    }
  }, [getPaginatedProducts]);

  const { products = [], totalProducts = 0, totalPages = 0 } = paginatedData;

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (onNavigateToProducts) {
      onNavigateToProducts();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [setCurrentPage, onNavigateToProducts]);

  const skeletonItems = useMemo(() => 
    Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)
  , []);

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading products: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Results summary */}
      <Box sx={{ 
        mb: 3, 
        p: 2.5, 
        backgroundColor: 'background.paper', 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 1
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {loading ? (
              'Loading products...'
            ) : (
              <>
                <Box component="span" sx={{ color: 'primary.main' }}>{products.length}</Box>
                {' '}of{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>{totalProducts}</Box>
                {' '}Products
              </>
            )}
          </Typography>
          {totalPages > 1 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Page {currentPage} of {totalPages}
            </Typography>
          )}
        </Box>
        <Box>
          {!isMobile && (
                      <Paper variant="outlined" sx={{ display: 'flex', borderRadius: 2 }}>
                        <IconButton
                          onClick={() => setViewMode('grid')}
                          color={viewMode === 'grid' ? 'primary' : 'default'}
                          size="small"
                        >
                          <GridView />
                        </IconButton>
                        <IconButton
                          onClick={() => setViewMode('list')}
                          color={viewMode === 'list' ? 'primary' : 'default'}
                          size="small"
                        >
                          <ViewList />
                        </IconButton>
                      </Paper>
                    )}
        </Box>
      </Box>

      {/* Product grid */}
      <Grid container spacing={viewMode === 'grid' ? 2.5 : 3}>
        {loading ? (
          skeletonItems
        ) : products.length === 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 8,
                textAlign: 'center',
                backgroundColor: 'action.hover',
                borderRadius: 3
              }}
            >
              <Box 
                sx={{ 
                  fontSize: 80, 
                  mb: 2,
                  opacity: 0.5
                }}
              >
                🔍
              </Box>
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search terms
              </Typography>
            </Box>
          </Grid>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} lg={viewMode === 'grid' ? 3 : 12} key={product.id}>
              <ProductCard product={product} viewMode={viewMode} />
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => handlePageChange(1)}
              size="small"
              disabled={currentPage === 1}
              aria-label="first page"
            >
              <FirstPage />
            </IconButton>

            <IconButton
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              size="small"
              disabled={currentPage === 1}
              aria-label="previous page"
            >
              <ChevronLeft />
            </IconButton>

            {/* Page number buttons - show window around current page */}
            {(() => {
              const pages = [];
              const maxButtons = 7;
              let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
              let end = start + maxButtons - 1;
              if (end > totalPages) {
                end = totalPages;
                start = Math.max(1, end - maxButtons + 1);
              }
              for (let p = start; p <= end; p += 1) {
                pages.push(
                  <Button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    variant={p === currentPage ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ minWidth: 40, px: 1.2, fontWeight: 700 }}
                  >
                    {p}
                  </Button>
                );
              }
              return pages;
            })()}

            <IconButton
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              size="small"
              disabled={currentPage === totalPages}
              aria-label="next page"
            >
              <ChevronRight />
            </IconButton>

            <IconButton
              onClick={() => handlePageChange(totalPages)}
              size="small"
              disabled={currentPage === totalPages}
              aria-label="last page"
            >
              <LastPage />
            </IconButton>
          </Stack>
        </Box>
      )}
    </Box>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;