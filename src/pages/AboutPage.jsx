import React from 'react';
import PageTransition from '../components/common/PageTransition';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack
} from '@mui/material';
import {
  Diversity3,
  Timeline,
  Lightbulb,
  Shield
} from '@mui/icons-material';

const AboutPage = () => {
  const pillars = [
    {
      title: 'Community First',
      description: 'We listen closely to shopper feedback and collaborate with independent makers to keep our catalogue fresh and relevant.',
      icon: Diversity3
    },
    {
      title: 'Sustainable Growth',
      description: 'From recycled packaging to carbon-aware shipping decisions, every improvement is measured against its environmental impact.',
      icon: Timeline
    },
    {
      title: 'Innovation-Driven',
      description: 'Our team experiments with new technologies so browsing, discovering, and buying products feels effortless on any device.',
      icon: Lightbulb
    },
    {
      title: 'Data You Can Trust',
      description: 'We protect shopper privacy, secure transactions, and operate with transparency in how recommendations and reviews are displayed.',
      icon: Shield
    }
  ];

  return (
    <PageTransition>
    <div className="about-page-container">
      <div className="about-page-heading">
        We are ShopEasy — your modern retail companion.
      </div>
      <p style={{ color: '#64748b', fontSize: '1.08rem', lineHeight: 1.8, marginBottom: 36 }}>
        ShopEasy started as a small collective of designers, product enthusiasts, and engineers determined to build an online store that values depth over endless scrolling. Today we curate collections from trusted partners around the world, pairing them with inspiration, editorial storytelling, and services that help every shopper feel confident.
      </p>

      <Grid container spacing={3}>
        {pillars.map((pillar) => {
          const IconComponent = pillar.icon;
          return (
            <Grid item xs={12} md={6} key={pillar.title}>
              <div className="about-page-pillar-card">
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconComponent color="primary" />
                  <span className="about-page-pillar-title">{pillar.title}</span>
                </Stack>
                <div className="about-page-pillar-desc">{pillar.description}</div>
              </div>
            </Grid>
          );
        })}
      </Grid>

      <div className="about-page-promise">
        <div className="about-page-promise-title">Our promise</div>
        <div className="about-page-promise-desc">
          We stand behind every order. That means clear delivery estimates, responsive communication, flexible returns, and a product guarantee that reflects our trust in the brands we stock. If an experience ever falls short, our support team is empowered to make it right.
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default AboutPage;
