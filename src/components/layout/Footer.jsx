import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube, ArrowUpward } from '@mui/icons-material';
import { useLocale } from '../../contexts/useLocale';
import { PartnerLogoPlaceholder } from './FooterAssets';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });
  const { lang, currency, setLang, setCurrency } = useLocale();

  const submitNewsletter = () => {
    const email = (newsletterEmail || '').trim();
    const valid = /^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(email);
    if (!valid) {
      setSnack({ open: true, severity: 'error', message: 'Enter a valid email address.' });
      return;
    }
    setSnack({ open: true, severity: 'success', message: 'Subscribed — check your inbox!' });
    setNewsletterEmail('');
  };

  const handleCloseSnack = () => setSnack(s => ({ ...s, open: false }));
  const handleBackToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Box component="footer" sx={{ mt: 'auto', backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>ShopEasy</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Handpicked products, delivered with care.</Typography>
            <Stack spacing={0.5}>
              <Link href="/about" underline="hover">About Us</Link>
              <Link href="/contact" underline="hover">Contact Us</Link>
              <Link href="/careers" underline="hover">Careers</Link>
              <Link href="/blog" underline="hover">Blog</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Customer Support</Typography>
            <Stack spacing={0.5}>
              <Link href="/help" underline="hover">Help Center / FAQs</Link>
              <Link href="/shipping" underline="hover">Shipping & Delivery</Link>
              <Link href="/returns" underline="hover">Returns & Refunds</Link>
              <Link href="/payment" underline="hover">Payment Methods</Link>
              <Link href="/privacy" underline="hover">Privacy Policy</Link>
              <Link href="/terms" underline="hover">Terms & Conditions</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Shop</Typography>
            <Grid container>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Link href="/products" underline="hover">All Products</Link>
                  <Link href="/products/men" underline="hover">Men</Link>
                  <Link href="/products/women" underline="hover">Women</Link>
                  <Link href="/products/kids" underline="hover">Kids</Link>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Link href="/new" underline="hover">New Arrivals</Link>
                  <Link href="/sale" underline="hover">Offers / Sale</Link>
                  <Link href="/best-sellers" underline="hover">Best Sellers</Link>
                  <Link href="/gift-cards" underline="hover">Gift Cards</Link>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Connect with us</Typography>
            <Box sx={{ mb: 1 }}>
              <IconButton size="small" href="#" aria-label="Facebook"><Facebook fontSize="small" /></IconButton>
              <IconButton size="small" href="#" aria-label="Twitter"><Twitter fontSize="small" /></IconButton>
              <IconButton size="small" href="#" aria-label="Instagram"><Instagram fontSize="small" /></IconButton>
              <IconButton size="small" href="#" aria-label="YouTube"><YouTube fontSize="small" /></IconButton>
            </Box>

            <Typography variant="body2" sx={{ mb: 1 }}>Subscribe to our newsletter</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Email address"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button variant="contained" onClick={submitNewsletter}>Subscribe</Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel id="lang-label">Language</InputLabel>
                <Select labelId="lang-label" value={lang} label="Language" onChange={e => setLang(e.target.value)}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">हिन्दी</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel id="cur-label">Currency</InputLabel>
                <Select labelId="cur-label" value={currency} label="Currency" onChange={e => setCurrency(e.target.value)}>
                  <MenuItem value="INR">INR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {/** Payment logos */}
                {[
                  { name: 'Visa', src: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png' },
                  { name: 'MasterCard', src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
                  { name: 'UPI', src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg' },
                  { name: 'PayPal', src: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' }
                ].map((l) => (
                  <Box
                    key={l.name}
                    component="span"
                    title={l.name}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 56, sm: 64 },
                      height: { xs: 30, sm: 36 },
                      bgcolor: 'background.default',
                      borderRadius: 1.5,
                      p: 0.5,
                      boxShadow: 0,
                      transition: 'transform .15s, box-shadow .15s',
                      '&:hover': { transform: 'scale(1.06)', boxShadow: 3 }
                    }}
                  >
                    <Box component="img" src={l.src} alt={l.name} sx={{ maxHeight: '70%', maxWidth: '90%' }} />
                  </Box>
                ))}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Box component="img" src="/assets/secure-payment.svg" alt="Secure payments" sx={{ width: 36, height: 36 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Secure checkout</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Encrypted & protected</Typography>
                  </Box>
                </Box>
              </Stack>

              {/** App badges on the same row (desktop) or below (mobile) */}
              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, md: 0 }, ml: { md: 4 } }}>
                <Box
                  sx={{
                    width: { xs: 120, sm: 140 },
                    height: { xs: 34, sm: 40 },
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'transform .15s, box-shadow .15s',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 3 }
                  }}
                >
                  <Box component="img" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>

                <Box
                  sx={{
                    width: { xs: 120, sm: 140 },
                    height: { xs: 34, sm: 40 },
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'transform .15s, box-shadow .15s',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 3 }
                  }}
                >
                  <Box component="img" src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button size="small" onClick={handleBackToTop} startIcon={<ArrowUpward />}>Back to top</Button>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} ShopEasy — All rights reserved.</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookie Policy</Link>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <PartnerLogoPlaceholder width={120} />
              <PartnerLogoPlaceholder width={120} />
              <PartnerLogoPlaceholder width={120} />
            </Stack>
          </Grid>
        </Grid>

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Footer;
