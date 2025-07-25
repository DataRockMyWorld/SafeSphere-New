import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Avatar,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
        {/* Logo/Brand Section */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box
            sx={{
            display: 'flex',
            alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              mr: 2,
            }}
          >
            <SecurityIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #ffffff 30%, #f0f8ff 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' },
              fontFamily: '"Inter", sans-serif',
            }}
          >
          SafeSphere
        </Typography>
        </Box>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {/* Welcome Message */}
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Chip
                label={`Welcome back, ${user?.first_name || 'User'}!`}
                sx={{
                  background: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  fontWeight: 500,
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.25),
                  },
                }}
              />
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Home">
                <IconButton
                  onClick={() => navigate('/')}
                  sx={{
                    color: 'white',
                    background: alpha(theme.palette.common.white, 0.1),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    '&:hover': {
                      background: alpha(theme.palette.common.white, 0.2),
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                }}
              >
                  <HomeIcon />
                </IconButton>
              </Tooltip>

              {/* Removed Admin Panel Link */}
              <NotificationBell />
            </Box>
              
            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{
                    color: 'white',
                    background: alpha(theme.palette.common.white, 0.1),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    '&:hover': {
                      background: alpha(theme.palette.common.white, 0.2),
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                    }}
                  >
                    {user?.first_name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: theme.shadows[8],
                    borderRadius: 2,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  },
                }}
              >
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={handleClose}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{
                background: alpha(theme.palette.common.white, 0.1),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.2),
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Login
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/register"
              sx={{
                background: alpha(theme.palette.common.white, 0.2),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.3),
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 