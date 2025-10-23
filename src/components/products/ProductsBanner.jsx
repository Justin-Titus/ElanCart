import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, useTheme, useMediaQuery } from '@mui/material';
import { LocalOffer, Bolt, TrendingUp, Star } from '@mui/icons-material';
import { useProducts } from '../../contexts/ProductContext';

const ProductsBanner = ({ totalProducts }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { products, loading } = useProducts();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get 4 random featured products for display (with safety check)
  const featuredProducts = products && products.length > 0 ? products.slice(0, 4) : [];

  const banners = [
    {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      title: 'Discover Amazing Products',
      subtitle: `${totalProducts || 0} premium items curated just for you`,
      icon: Star,
      tag: 'Explore Now',
      products: featuredProducts.slice(0, 3)
    },
    {
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      title: 'Limited Time Offers',
      subtitle: 'Save up to 50% on selected items',
      icon: LocalOffer,
      tag: 'Hot Deals',
      products: featuredProducts.slice(1, 4)
    },
    {
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      title: 'Flash Sale Today',
      subtitle: 'Grab your favorites before they\'re gone',
      icon: Bolt,
      tag: 'Trending',
      products: featuredProducts.slice(2, 5)
    },
    {
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      title: 'New Arrivals',
      subtitle: 'Fresh products added this week',
      icon: TrendingUp,
      tag: 'Just In',
      products: featuredProducts.slice(0, 3)
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only set up once

  // Don't render if products are still loading or empty
  if (loading || featuredProducts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 220, sm: 260, md: 300 },
        mb: 4,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: 3
      }}
    >
      {/* Slides */}
      {banners.map((banner, index) => {
        const IconComponent = banner.icon;
        return (
          <Paper
            key={index}
            elevation={0}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: banner.gradient,
              color: 'white',
              p: { xs: 3, md: 4 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: currentSlide === index ? 1 : 0,
              transform: currentSlide === index ? 'scale(1)' : 'scale(1.1)',
              transition: 'opacity 600ms ease, transform 600ms ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '60%',
                height: '200%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite',
                display: { xs: 'none', md: 'block' }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-30%',
                left: '-5%',
                width: '40%',
                height: '150%',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite',
                animationDelay: '1s',
                display: { xs: 'none', md: 'block' }
              },
              '@keyframes float': {
                '0%, 100%': {
                  transform: 'translateY(0) rotate(0deg)'
                },
                '50%': {
                  transform: 'translateY(-20px) rotate(5deg)'
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, flex: 1, mr: 2 }}>
              <Chip
                icon={<IconComponent sx={{ fontSize: 18 }} />}
                label={banner.tag}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 700,
                  mb: 2,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)'
                    },
                    '50%': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                {banner.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  fontWeight: 400,
                  fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                  textShadow: '0 1px 5px rgba(0,0,0,0.1)'
                }}
              >
                {banner.subtitle}
              </Typography>
            </Box>

            {/* Product Images Carousel */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                position: 'relative',
                zIndex: 1,
                height: { xs: 120, sm: 150, md: 180 },
                alignItems: 'center'
              }}
            >
              {banner.products && banner.products.length > 0 && (isMobile ? banner.products.slice(0,2) : banner.products).map((product, idx) => (
                <Box
                  key={product?.id || idx}
                  sx={{
                    width: { xs: 80, sm: 110, md: 140 },
                    height: { xs: 100, sm: 130, md: 160 },
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 3,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    animation: `slideUp 420ms ease-out ${Math.min(idx, 2) * 120}ms both`,
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.05)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                    '@keyframes slideUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  {product?.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  ) : (
                    <IconComponent sx={{ fontSize: 60, color: 'primary.main' }} />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        );
      })}

      {/* Slide Indicators */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2
        }}
      >
        {banners.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: currentSlide === index ? 32 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'white',
              opacity: currentSlide === index ? 1 : 0.5,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: currentSlide === index ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.2)'
              }
            }}
          />
        ))}
      </Stack>

      {/* Progress Bar */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          width: '100%',
          zIndex: 2
        }}
      >
        <Box
          sx={{
            height: '100%',
            backgroundColor: 'white',
            width: 0,
            animation: 'progress 5s linear infinite',
            '@keyframes progress': {
              '0%': {
                width: '0%'
              },
              '100%': {
                width: '100%'
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ProductsBanner;
