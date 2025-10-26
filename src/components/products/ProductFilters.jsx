import React, { useState, memo, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useProducts } from '../../contexts/ProductContext';

const ProductFilters = memo(() => {
  const { filters, setFilters, setSortBy, sortBy, getCategories, products } = useProducts();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const categories = Array.isArray(getCategories) ? getCategories : (typeof getCategories === 'function' ? getCategories() : []);

  // Treat thresholds as rupee values. Convert product prices to rupees using a fixed rate
  const priceOptions = useMemo(() => {
    const RATE = 83; // 1 product-price unit -> ~₹83 (used previously in project)
  const thresholds = [500, 1000, 2000, 5000, 10000, 20000];
  const buckets = [{ key: 'any', label: 'Any price', range: [0, Infinity] }];
    const nf = new Intl.NumberFormat('en-IN');

    let prev = 0;
    thresholds.forEach((t) => {
      const lo = prev === 0 ? 0 : prev + 1;
      const hi = t;

      // count products in this rupee range by converting product.price -> rupees
      const count = (products || []).filter(p => {
        const priceUnit = Number(p.price) || 0;
        const priceRupee = Math.round(priceUnit * RATE);
        return priceRupee >= lo && priceRupee <= hi;
      }).length;

      if (count > 0) {
        const key = `upto-${t}`;
        const label = lo === 0 ? `Under ₹${nf.format(t)}` : `₹${nf.format(lo)}–₹${nf.format(hi)}`;
        buckets.push({ key, label, range: [lo, hi] });
      }
      prev = t;
    });

    // Final bucket: above the last threshold
    const finalLo = prev + 1;
    const finalCount = (products || []).filter(p => {
      const priceUnit = Number(p.price) || 0;
      const priceRupee = Math.round(priceUnit * RATE);
      return priceRupee >= finalLo;
    }).length;
    if (finalCount > 0) {
      // show 'Over ₹prev' rather than '10001+' or similar
      buckets.push({ key: `over-${prev}`, label: `Over ₹${nf.format(prev)}`, range: [finalLo, Infinity] });
    }

    return buckets;
  }, [products]);

  const detectSelectedPriceKey = () => {
    const RATE = 83;
    const curMinRupee = Math.round((Number(filters?.minPrice ?? 0)) * RATE);
    const curMaxRupee = filters?.maxPrice === Infinity ? Infinity : Math.round(Number(filters?.maxPrice ?? 1000) * RATE);
    const found = priceOptions.find(o => o.range[0] === curMinRupee && o.range[1] === curMaxRupee);
    return found ? found.key : 'any';
  };

  const [selectedPriceKey, setSelectedPriceKey] = useState(detectSelectedPriceKey);

  // Keep the selected price dropdown in sync with external filter changes
  // (e.g., when filters are updated programmatically elsewhere).
  React.useEffect(() => {
    setSelectedPriceKey(detectSelectedPriceKey());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.minPrice, filters?.maxPrice, priceOptions]);

  const handleCategoryChange = (event) => setFilters({ category: event.target.value });
  const handleSortChange = (event) => setSortBy(event.target.value);

  const handlePriceSelect = (event) => {
    const key = event.target.value;
    setSelectedPriceKey(key);
    const option = priceOptions.find(o => o.key === key) || priceOptions[0];
    // option.range is in rupees; convert back to product price units when setting filters
    const RATE = 83;
    const loR = option.range[0];
    const hiR = option.range[1];
    const minUnit = loR === 0 ? 0 : loR / RATE;
    const maxUnit = hiR === Infinity ? Infinity : hiR / RATE;
    setFilters({ minPrice: minUnit, maxPrice: maxUnit });
  };

  const handleClearFilters = () => {
    setFilters({ category: '', minPrice: 0, maxPrice: Infinity, searchTerm: '' });
    setSelectedPriceKey('any');
    setSortBy('');
  };

  const sortOptions = [
    // Removed name-based sorting as requested
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'rating-desc', label: 'Rating (High to Low)' }
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {!isMobile && (<Typography variant="body1">Filters</Typography>)}
      {/* Sort By */}
      <FormControl size="small" sx={{ minWidth: { xs: 150, sm: 180 } }}>
        <InputLabel id="sort-by-label">Sort By</InputLabel>
        <Select
          labelId="sort-by-label"
          label="Sort By"
          value={sortBy}
          onChange={handleSortChange}
          sx={{ borderRadius: 2 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Category */}
      <FormControl size="small" sx={{ minWidth: { xs: 160, sm: 200 } }}>
        <InputLabel id="category-label">Category</InputLabel>
        <Select
          labelId="category-label"
          label="Category"
          value={filters?.category ?? ''}
          onChange={handleCategoryChange}
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range (dropdown built from products) */}
      <FormControl size="small" sx={{ minWidth: { xs: 150, sm: 220 } }}>
        <InputLabel id="price-range-label">Price</InputLabel>
        <Select
          labelId="price-range-label"
          label="Price"
          value={selectedPriceKey}
          onChange={handlePriceSelect}
          sx={{ borderRadius: 2 }}
        >
          {priceOptions.map(opt => (
            <MenuItem key={opt.key} value={opt.key}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button size="small" onClick={handleClearFilters} color="secondary" variant="text" sx={{ textTransform: 'none', fontWeight: 600, ml: 'auto' }}>
        Clear All
      </Button>
    </Box>
  );
});

ProductFilters.displayName = 'ProductFilters';

export default ProductFilters;