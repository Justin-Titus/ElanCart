import React, { useState, lazy, Suspense, useRef, useEffect, memo } from 'react';
import {
  Box,
  Typography,
  Fab,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import { FilterList, Close, GridView, ViewList } from '@mui/icons-material';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
const ProductsBanner = lazy(() => import('../components/products/ProductsBanner'));
const TrustBadges = lazy(() => import('../components/products/TrustBadges'));
import { useProducts } from '../contexts/ProductContext';
// import { useNavigate } from 'react-router-dom';

const ProductsPage = memo(() => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const navigate = useNavigate();
  const { getPaginatedProducts, filters, setFilters, sortBy, setSortBy } = useProducts();
  let totalProducts = 0;
  try {
    const gp = getPaginatedProducts();
    totalProducts = gp.totalProducts || 0;
  } catch (err) {
    console.error('Error calling getPaginatedProducts in ProductsPage:', err);
    totalProducts = 0;
  }

  // Ref to the product list container so we can scroll to it when searching
  const productsRef = useRef(null);

  // Local error boundary to show inline errors during development/debug
  class LocalErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, info) {
      console.error('LocalErrorBoundary caught:', error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="error">Component error</Typography>
            <Typography variant="body2" color="text.secondary">{String(this.state.error?.message || this.state.error)}</Typography>
          </Box>
        );
      }
      return this.props.children;
    }
  }

  const searchTerm = filters?.searchTerm || '';

  useEffect(() => {
    // When a search term is set, scroll to the products list for context
    if (searchTerm && searchTerm.trim().length > 0) {
      // Slight delay to allow any navigation/paint to finish
      const t = setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to top of page
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchTerm]);

  const handleDrawerToggle = () => {
    setMobileFiltersOpen((prev) => !prev);
  };

  const filtersDrawer = (
    <Box sx={{ width: 300, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <ProductFilters />
    </Box>
  );

  // Active filters UI removed as requested

  return (
    <Box
      sx={{ 
        width: '100%', 
        backgroundColor: 'background.default', 
        overflowX: 'hidden',
        opacity: 0,
        animation: 'fadeIn 0.3s ease-out forwards'
      }}
    >

      {/* Animated Banner Section (lazy) */}
      <Suspense fallback={<Box sx={{ height: { xs: 200, md: 260 }, mb: 4, borderRadius: 3, bgcolor: 'action.hover' }} />}> 
        <ProductsBanner totalProducts={totalProducts} />
      </Suspense>

      {/* Trust Badges (lazy) */}
      <Suspense fallback={null}>
        <TrustBadges />
      </Suspense>

  {/* Quick Filters removed */}

      {/* Filters */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
      }}>
        {/* {!isMobile && (
          <Typography variant="body2">Filters</Typography>}
        )
      } */}
        <Stack direction="column" spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
          {/* Show inline filters only on non-mobile. On mobile we'll use the FAB + Drawer. */}
          {!isMobile && (
            <Box sx={{ width: '100%' }}>
              <ProductFilters />
            </Box>
          )}

          {/* Mobile-only: show applied filters as chips for quick visibility and removal */}
          {/* {isMobile && ( */}
            <Box sx={{ width: '100%', mt: 0.5 }}>
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                {/* Search term */}
                {filters.searchTerm && filters.searchTerm.trim() !== '' && (
                  <Chip
                    label={`Search: ${filters.searchTerm}`}
                    size="small"
                    onDelete={() => setFilters({ searchTerm: '' })}
                  />
                )}

                {/* Category */}
                {filters.category && (
                  <Chip
                    label={`Category: ${filters.category}`}
                    size="small"
                    onDelete={() => setFilters({ category: '' })}
                  />
                )}

                {/* Price range (show only if not defaults) */}
                {((filters.minPrice || 0) > 0 || filters.maxPrice !== Infinity) && (
                  <Chip
                    label={(() => {
                      const lo = Math.round((filters.minPrice || 0) * 83);
                      const hi = filters.maxPrice === Infinity ? null : Math.round(filters.maxPrice * 83);
                      return hi ? `Price: ₹${lo} - ₹${hi}` : `Price: ₹${lo}+`;
                    })()}
                    size="small"
                    onDelete={() => setFilters({ minPrice: 0, maxPrice: Infinity })}
                  />
                )}

                {/* Sort (show when a sort is active) */}
                {sortBy && sortBy !== '' && (
                  <Chip
                    label={(() => {
                      switch (sortBy) {
                        case 'price-asc': return 'Sort: Price (Low → High)';
                        case 'price-desc': return 'Sort: Price (High → Low)';
                        case 'rating-desc': return 'Sort: Rating (High → Low)';
                        default: return `Sort: ${sortBy}`;
                      }
                    })()}
                    size="small"
                    onDelete={() => setSortBy('')}
                  />
                )}
              </Stack>
            </Box>
          {/* )} */}
        </Stack>

        <Stack direction="row" spacing={1}>
          
          
          {isMobile && (
            <Fab
              color="primary"
              variant="extended"
              aria-label="filters"
              onClick={handleDrawerToggle}
              size="medium"
            >
              <FilterList sx={{ mr: 1 }} />
              Filters
            </Fab>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 3 },
          width: '100%'
        }}
      >
        {/* {!isMobile && (
          <Box
            component="aside"
            sx={{
              width: 280,
              flexShrink: 0,
              position: 'sticky',
              top: 96,
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'divider',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'text.secondary',
              }
            }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }}
            >
              <ProductFilters />
            </Paper>
          </Box>
        )} */} 

        <Box component="main" sx={{ flex: 1, minWidth: 0 }} ref={productsRef}>
          <LocalErrorBoundary>
            <ProductGrid onNavigateToProducts={() => {
              if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} />
          </LocalErrorBoundary>
        </Box>
      </Box>

      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileFiltersOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
        >
          {filtersDrawer}
        </Drawer>
      )}
    </Box>
  );
});

ProductsPage.displayName = 'ProductsPage';

export default ProductsPage;
