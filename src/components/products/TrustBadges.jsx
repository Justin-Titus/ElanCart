import React from 'react';
import { Box, Typography, Paper, Grid, alpha } from '@mui/material';
import { TrendingUp, LocalShipping, Verified, Loyalty } from '@mui/icons-material';

const TrustBadges = () => {
  const badges = [
    {
      icon: TrendingUp,
      title: '50K+',
      subtitle: 'Happy Customers',
      color: '#4CAF50'
    },
    {
      icon: LocalShipping,
      title: 'Free Delivery',
      subtitle: 'On orders above ₹4,150',
      color: '#2196F3'
    },
    {
      icon: Verified,
      title: '100% Authentic',
      subtitle: 'Genuine Products',
      color: '#FF9800'
    },
    {
      icon: Loyalty,
      title: 'Best Prices',
      subtitle: 'Price Match Guarantee',
      color: '#E91E63'
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => alpha(theme.palette.primary.main, 0.02)
      }}
    >
      <Grid container spacing={2}>
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <Grid item xs={6} md={3} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'background.paper',
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(badge.color, 0.1),
                    flexShrink: 0
                  }}
                >
                  <IconComponent sx={{ fontSize: 28, color: badge.color }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                    {badge.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {badge.subtitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default TrustBadges;
