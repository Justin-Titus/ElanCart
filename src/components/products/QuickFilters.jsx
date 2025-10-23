import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { LocalOffer, Whatshot, NewReleases, Star } from '@mui/icons-material';
import { useProducts } from '../../contexts/ProductContext';

const QuickFilters = () => {
  const { setFilters, setSortBy } = useProducts();

  const quickFilters = [
    {
      label: 'Best Sellers',
      icon: Whatshot,
      action: () => setSortBy('rating-desc'),
      color: '#FF6B6B'
    },
    {
      label: 'New Arrivals',
      icon: NewReleases,
      action: () => setSortBy('name-desc'),
      color: '#4ECDC4'
    },
    {
      label: 'Top Rated',
      icon: Star,
      action: () => setSortBy('rating-desc'),
      color: '#FFD93D'
    },
    {
      label: 'Deals',
      icon: LocalOffer,
      action: () => setFilters({ maxPrice: 500 }),
      color: '#6C5CE7'
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
        Quick Filters:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {quickFilters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <Chip
              key={filter.label}
              icon={<IconComponent sx={{ fontSize: 18, color: filter.color }} />}
              label={filter.label}
              onClick={filter.action}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: filter.color,
                  backgroundColor: `${filter.color}15`,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default QuickFilters;
