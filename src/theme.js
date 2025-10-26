import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e40af',
    },
    secondary: {
      main: '#f97316',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Use Poppins for headings for a clean, professional look; Inter remains the UI/body font
    h1: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#ffffff',
          color: '#111827',
        },
      },
    },
  },
});

export default theme;
