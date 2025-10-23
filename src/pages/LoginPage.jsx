import React, { useState } from 'react';
import PageTransition from '../components/common/PageTransition';
import { Box, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { useUser } from '../contexts/useUser';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const { isAuthenticated, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');

  // If already authenticated, send user to profile
  // (when landing on /login directly) or to the original page if present
  const fromLocation = location?.state?.from || { pathname: '/profile' };
  if (isAuthenticated) return <Navigate to={fromLocation} replace />;

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Validation helpers
  const validateEmail = email => /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePassword = pw => pw && pw.length >= 6;
  const validateName = name => name && name.trim().length > 0;

  const handleSubmit = e => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !validateName(form.name)) {
      setError('Name is required for signup.');
      return;
    }
    // Simulate login/signup
    login({ email: form.email, name: form.name, address: '', orders: [] });
    // After login navigate back to the page that initiated the login, preserving any state
    const destLoc = location?.state?.from || { pathname: '/profile' };
    // Navigate using the full location object to preserve pathname/search/hash/state
    navigate(destLoc, { replace: true });
  };


  return (
    <PageTransition>
    <Box sx={{ maxWidth: 400, mx: 'auto', py: 3 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {mode === 'login' ? 'Login to your account' : 'Create an account'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {mode === 'signup' && (
              <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
            )}
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth />
            <Button type="submit" variant="contained" fullWidth>
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </Button>
          </Stack>
        </Box>
        <Button
          onClick={() => { setMode(m => (m === 'login' ? 'signup' : 'login')); setError(''); }}
          sx={{ mt: 2 }}
          fullWidth
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Button>
      </Paper>
    </Box>
    </PageTransition>
  );
};

export default LoginPage;
