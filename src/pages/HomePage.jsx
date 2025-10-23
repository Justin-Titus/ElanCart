import React, { memo } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  LocalShipping,
  Verified,
  SupportAgent,
} from "@mui/icons-material";
import HeroShowcase from "../components/home/HeroShowcase";
import GlowingCard from "../components/common/GlowingCard";
import SplitText from "../components/common/SplitText";
import { useProducts } from "../contexts/ProductContext";
import { useNavigate } from "react-router-dom";
import useInView from "../hooks/useInView";

const HomePage = memo(() => {
  const features = [
    {
      title: "Curated Collections",
      description:
        "Discover handpicked items across fashion, tech, home, and wellness tailored to your tastes.",
      icon: ShoppingBag,
    },
    {
      title: "Fast & Free Shipping",
      description:
        "Every order over ₹4,150 ships at no additional cost, with real-time tracking and smooth delivery.",
      icon: LocalShipping,
    },
    {
      title: "Trusted Quality",
      description:
        "We partner with verified brands and ensure every product meets rigorous quality standards.",
      icon: Verified,
    },
    {
      title: "Always-On Support",
      description:
        "Reach our support specialists any day of the week for product guidance or order help.",
      icon: SupportAgent,
    },
  ];

  const spotlightCategories = [
    {
      title: "Smart Living",
      description:
        "Upgrade your home with connected devices and smart essentials.",
    },
    {
      title: "Style Refresh",
      description:
        "Seasonal fashion edits that balance comfort with standout design.",
    },
    {
      title: "Wellness Finds",
      description:
        "Self-care staples, from at-home spa to mindful tech accessories.",
    },
  ];

  const { products, getCategories, setFilters } = useProducts();
  const navigate = useNavigate();

  // categories may be provided as an array (getCategories) from context; handle both function/array shapes
  const categories =
    typeof getCategories === "function" ? getCategories() : getCategories || [];

  // Build card data: representative image for each category (first product found)
  const categoryCards = (categories || [])
    .map((cat) => {
      const found = (products || []).find(
        (p) =>
          p.category && p.category.toLowerCase() === (cat || "").toLowerCase()
      );
      return {
        name: cat,
        title: cat
          .split(" ")
          .map((s) => s[0].toUpperCase() + s.slice(1))
          .join(" "),
        image:
          found?.image ||
          "https://via.placeholder.com/400x280?text=" + encodeURIComponent(cat),
      };
    })
    .slice(0, 8); // show up to 8 categories

  const handleCategoryClick = (category) => {
    setFilters({ category });
    navigate("/products");
  };

  const MotionBox = motion(Box);
  const MotionPaper = motion(Paper);

  // Small component for category card so each card can use the in-view hook
  function CategoryCard({ cat, idx }) {
    const [ref, inView] = useInView({ threshold: 0.14 });

    const sx = {
      cursor: "pointer",
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: 1,
      display: 'flex',
      flexDirection: 'column',
      aspectRatio: '1 / 1',
      p: { xs: 1, sm: 2, md: 4 },
      boxSizing: 'border-box',
      transition: 'box-shadow 220ms, transform 220ms',
      '&:hover': { boxShadow: 6, transform: 'translateY(-6px)' }
    };

    return (
      <Grid item xs={6} sm={6} md={3} key={cat.name}>
        <MotionPaper
          ref={ref}
          onClick={() => handleCategoryClick(cat.name)}
          elevation={1}
          sx={sx}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: idx * 0.06 }}
        >
          <Box
            sx={{
              flex: '0 0 60%',
              width: '100%',
              borderRadius: 1,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundImage: `url(${cat.image})`,
            }}
          />

          <Box sx={{ px: { xs: 0.25, sm: 0.5 }, flex: '1 1 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {cat.title}
            </Typography>
          </Box>
        </MotionPaper>
      </Grid>
    );
  }

  return (
    <MotionBox
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 4, md: 6 },
        width: "100%",
        opacity: 0,
        animation: 'fadeIn 0.4s ease-out forwards'
      }}
    >
        <HeroShowcase />
        {/* Category cards - ecommerce style */}
        <Box>
          <Box sx={{ textAlign: 'center' }}>
            <SplitText
              text="Shop by category"
              tag="h4"
              className="home-title"
              delay={60}
              duration={0.5}
              splitType="words"
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Explore top categories curated from our catalog. Click a category to
            view related products.
          </Typography>

          <Grid container spacing={2}>
            {categoryCards.map((cat, idx) => (
              <CategoryCard cat={cat} idx={idx} key={cat.name} />
            ))}
          </Grid>
        </Box>
        <Box>
          <Box sx={{ textAlign: 'center' }}>
            <SplitText
              text="Why shoppers love ElanCart"
              tag="h4"
              className="home-title"
              delay={60}
              duration={0.5}
              splitType="words"
            />
          </Box>
          <Grid container spacing={3}>
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={feature.title}>
                  <GlowingCard glowColor="#5999ff" style={{ height: "100%" }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                        <IconComponent color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                      >
                        {feature.description}
                      </Typography>
                    </Paper>
                  </GlowingCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <SplitText
              text="Featured spotlights"
              tag="h4"
              className="spotlight-title"
              delay={60}
              duration={0.5}
              splitType="words"
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Fresh drops land every week. Browse highlights from our latest
            collections and find your next favourite purchase.
          </Typography>
          <Grid container spacing={3}>
            {spotlightCategories.map((category, idx) => (
              <Grid item xs={12} md={4} key={category.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    transition:
                      "transform 0.25s, box-shadow 0.25s, background 0.25s",
                    boxShadow: 0,
                    background: "#fff",
                    "&:hover": {
                      transform:
                        idx === 0
                          ? "scale(1.04) rotate(-1deg)"
                          : idx === 1
                          ? "scale(1.04)"
                          : "scale(1.04) rotate(1deg)",
                      boxShadow:
                        idx === 0
                          ? "0 4px 24px #3b82f622"
                          : idx === 1
                          ? "0 4px 24px #05966922"
                          : "0 4px 24px #7c3aed22",
                      background:
                        idx === 0
                          ? "#f0f7ff"
                          : idx === 1
                          ? "#f0fff7"
                          : "#f6f0ff",
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                    {category.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {category.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </MotionBox>
  );
});

export default HomePage;
