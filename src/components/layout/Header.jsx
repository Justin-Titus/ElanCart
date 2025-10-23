import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  InputBase,
  alpha,
  Button,
  Menu,
  MenuItem,
  Drawer
} from '@mui/material';
import {
  ShoppingCart,
  Search as SearchIcon,
  Store,
  FavoriteBorder,
  Menu as MenuIcon,
  AccountCircle,
  Close as CloseIcon
} from '@mui/icons-material';
import { useUser } from '../../contexts/useUser';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useFavourites } from '../../contexts/FavouritesContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.default, 1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Header = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { getFavouritesCount } = useFavourites();
  const { setFilters, filters } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileNavAnchor, setMobileNavAnchor] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const mobileSearchInputRef = useRef(null);

  const { isAuthenticated } = useUser();
  
  const handleProfileIconClick = () => {
    if (isAuthenticated) navigate('/profile');
    else navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActivePath = (path) => {
    if (path === '/products') {
      return location.pathname === '/products' || location.pathname.startsWith('/product/');
    }
    return location.pathname === path;
  };

  const handleNavClick = useCallback((path) => {
    if (path !== '/products') {
      setFilters({ searchTerm: '' });
      setSearchTerm('');
    }
    navigate(path);
    setMobileNavAnchor(null);
  }, [navigate, setFilters]);

  const handleMobileMenuOpen = (event) => {
    setMobileNavAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileNavAnchor(null);
  };

  const handleSearchChange = (event) => {
    // Update local input only. Apply filters when user confirms (Enter or search button).
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleSearchSubmit = useCallback(() => {
    const trimmed = (searchTerm || '').trim();
    setFilters({ searchTerm: trimmed });
    if (location.pathname !== '/products') {
      navigate('/products');
    }
    setMobileSearchOpen(false);
  }, [searchTerm, setFilters, location.pathname, navigate]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      // optional: clear input and filters
      setSearchTerm('');
      setFilters({ searchTerm: '' });
    }
  };

  const openMobileSearch = () => setMobileSearchOpen(true);
  const closeMobileSearch = () => setMobileSearchOpen(false);
  const handleMobileSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
      closeMobileSearch();
    } else if (e.key === 'Escape') {
      setSearchTerm('');
      setFilters({ searchTerm: '' });
      closeMobileSearch();
    }
  };

  const handleLogoClick = () => {
    setSearchTerm('');
    setFilters({ searchTerm: '' });
    navigate('/');
    setMobileNavAnchor(null);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleFavouritesClick = () => {
    navigate('/favourites');
  };

  // Ensure the mobile search drawer closes when navigation occurs (e.g., after search submits)
  useEffect(() => {
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Also close mobile search when a search term is applied (covers same-page searches)
  useEffect(() => {
    if (filters?.searchTerm && filters.searchTerm.trim() !== '') {
      setMobileSearchOpen(false);
    }
  }, [filters?.searchTerm]);

  // When the mobile search drawer opens, ensure the input is focused (works even if Drawer keeps the node mounted)
  useEffect(() => {
    if (mobileSearchOpen) {
      // Small delay to allow the Drawer animation/paint to complete
      const t = setTimeout(() => {
        try {
          mobileSearchInputRef.current?.focus?.();
        } catch {
          /* ignore focus errors */
        }
      }, 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [mobileSearchOpen]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '100vw',
        left: 0,
        right: 0,
        flexShrink: 0,
        alignSelf: 'stretch',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255,255,255,0.82)',
        boxShadow: '0 2px 16px 0 rgba(60,60,120,0.07)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2, minHeight: { xs: 56, md: 72 } }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.2 }}
          onClick={handleLogoClick}
        >
          <Store sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ fontWeight: 800, letterSpacing: '0.02em', color: 'text.primary', fontSize: { xs: '1.3rem', md: '2rem' } }}
          >
            ShopEasy
          </Typography>
        </Box>

        <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => handleNavClick(item.path)}
              sx={{
                textTransform: 'none',
                fontWeight: isActivePath(item.path) ? 700 : 500,
                opacity: isActivePath(item.path) ? 1 : 0.75,
                borderBottom: isActivePath(item.path) ? '2px solid currentColor' : '2px solid transparent',
                borderRadius: 0,
                '&:hover': {
                  opacity: 1,
                  borderBottomColor: 'currentColor'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 0.5 }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search for products..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </Search>
        </Box>

        {/* mobile menu moved to the right side for small screens */}

  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Mobile search button - opens top Drawer */}
          <IconButton
            size="large"
            aria-label="search"
            color="inherit"
            onClick={openMobileSearch}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="favourites"
            color="inherit"
            onClick={handleFavouritesClick}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            <Badge badgeContent={getFavouritesCount()} color="secondary">
              <FavoriteBorder />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            aria-label="shopping cart"
            color="inherit"
            onClick={handleCartClick}
          >
            <Badge badgeContent={getCartItemCount()} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {/* User/Profile Icon */}
          <IconButton
            size="large"
            aria-label="user profile"
            color="inherit"
            onClick={handleProfileIconClick}
            sx={{ ml: 1 }}
          >
            <AccountCircle />
          </IconButton>
          {/* Hamburger for mobile on the right side */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', ml: 1 }}>
            <IconButton
              size="large"
              color="inherit"
              aria-label="open navigation"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={mobileNavAnchor}
        open={Boolean(mobileNavAnchor)}
        onClose={handleMobileMenuClose}
        keepMounted
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.path}
            selected={isActivePath(item.path)}
            onClick={() => handleNavClick(item.path)}
          >
            {item.label}
          </MenuItem>
        ))}
        {/* Show favourites in mobile hamburger menu only */}
        <MenuItem onClick={() => { handleMobileMenuClose(); handleFavouritesClick(); }}>
          Favourites
        </MenuItem>
      </Menu>
      {/* Mobile search drawer (top-anchored) */}
      <Drawer
        anchor="top"
        open={mobileSearchOpen}
        onClose={closeMobileSearch}
        ModalProps={{ keepMounted: true, disableScrollLock: true, BackdropProps: { invisible: true, sx: { pointerEvents: 'none' } } }}
        PaperProps={{ sx: { p: 2, borderRadius: 0 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search sx={{ flex: 1 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search for products..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleMobileSearchKeyDown}
              inputRef={mobileSearchInputRef}
              autoFocus
            />
          </Search>
          <IconButton onClick={closeMobileSearch} aria-label="close search">
            <CloseIcon />
          </IconButton>
        </Box>
      </Drawer>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default Header;