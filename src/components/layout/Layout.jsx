import React, { memo } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { LocaleProvider } from '../../contexts/LocaleContext';

const Layout = memo(({ children }) => {
  return (
    <LocaleProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Header />
        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            py: 3,
            px: { xs: 2, sm: 3 }
          }}
        >
          {children}
        </Container>
        <Footer />
      </Box>
    </LocaleProvider>
  );
});

Layout.displayName = 'Layout';

export default Layout;