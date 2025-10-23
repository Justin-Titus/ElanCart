import React, { useState } from 'react';
import PageTransition from '../components/common/PageTransition';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stack,
  Alert
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (status === 'error') {
      setStatus(null);
    }
  };

  // Validation helpers
  const validateEmail = email => /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
  const validateName = name => name && name.trim().length > 0;
  const validateMessage = msg => msg && msg.trim().length > 5;

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Reset errors
    const newErrors = { name: '', email: '', message: '' };
    let hasError = false;

    // Validate name
    if (!validateName(formData.name)) {
      newErrors.name = 'Please enter your full name';
      hasError = true;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us how we can help you';
      hasError = true;
    } else if (!validateMessage(formData.message)) {
      newErrors.message = 'Message must be at least 5 characters long';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setStatus('error');
      return;
    }

    // Success
    setStatus('submitted');
    setFormData({ name: '', email: '', message: '' });
    setErrors({ name: '', email: '', message: '' });
  };


  return (
    <PageTransition>
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 6 } }}>
      <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, backgroundColor: 'background.paper' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          We are here to help.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Reach out with product questions, order updates, or partnership ideas. Our team responds within one business day and loves solving challenges for our community.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Send us a message
            </Typography>
            {status === 'submitted' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Thank you! We received your message and will be in touch shortly.
              </Alert>
            )}
            {status === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Please fill in all required fields correctly.
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  label="How can we help?"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  minRows={4}
                  error={!!errors.message}
                  helperText={errors.message}
                />
                <Button type="submit" variant="contained" size="large">
                  Send message
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Contact details
            </Typography>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Email color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    support@elancart.com
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Phone color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +1 (800) 555-0199
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <LocationOn color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Studio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    450 Market Street, Suite 200
                    <br />
                    San Francisco, CA 94105
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </PageTransition>
  );
};

export default ContactPage;
