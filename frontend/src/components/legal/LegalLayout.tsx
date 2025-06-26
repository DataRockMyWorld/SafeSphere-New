import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  useTheme,
  IconButton,
  useMediaQuery,
  Divider,
  Tooltip,
  AppBar,
  Toolbar,
  alpha,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  TrackChanges as TrackChangesIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import logo from '../../assets/logo.png';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

const menuItems = [
  {
    title: 'Law Library',
    description: 'Browse and manage legal resources and legislation',
    icon: <GavelIcon />,
    path: '/legal/library',
  },
  {
    title: 'Legal Register',
    description: 'Manage regulatory requirements and compliance',
    icon: <AssignmentIcon />,
    path: '/legal/register',
  },
  {
    title: 'Legislation Tracker',
    description: 'Track permits, licenses and expiry dates',
    icon: <TrackChangesIcon />,
    path: '/legal/tracker',
  },
];

const LegalLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    }
  };

  const currentDrawerWidth = isMobile ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            borderRadius: 0,
            boxShadow: '2px 0 20px rgba(0,0,0,0.08)',
            background: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Logo/Brand Section */}
          <Box
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              minHeight: 80,
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
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                LG
              </Typography>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
            <List sx={{ px: 1 }}>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.title}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip 
                      title={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {item.description}
                          </Typography>
                        </Box>
                      }
                      placement="right"
                      arrow
                      sx={{
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: theme.palette.grey[900],
                          color: 'white',
                          fontSize: '0.875rem',
                          padding: '12px 16px',
                          maxWidth: 250,
                          boxShadow: theme.shadows[8],
                          '& .MuiTooltip-arrow': {
                            color: theme.palette.grey[900],
                          },
                        },
                      }}
                    >
                      <ListItemButton
                        selected={location.pathname.startsWith(item.path)}
                        onClick={() => {
                          navigate(item.path);
                          if (isMobile) {
                            setMobileOpen(false);
                          }
                        }}
                        sx={{
                          minHeight: 48,
                          justifyContent: 'center',
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          mx: 1,
                          transition: 'all 0.2s ease-in-out',
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            },
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.primary.main,
                            },
                          },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            transform: 'translateX(4px)',
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            justifyContent: 'center',
                            color: location.pathname.startsWith(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                            fontSize: '1.25rem',
                            transition: 'color 0.2s ease-in-out',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                  {index === 0 && <Divider sx={{ my: 2, mx: 2 }} />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'white',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            color: theme.palette.text.primary,
            width: '100%',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Logo positioned in the corner */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="SafeSphere Logo"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                      border: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                />
              </Box>
              
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '1.25rem',
                  }}
                >
                  {menuItems.find(item => location.pathname.startsWith(item.path))?.title || 'Legal Management'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                  }}
                >
                  {menuItems.find(item => location.pathname.startsWith(item.path))?.description || ''}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <HomeIcon />
              </IconButton>
              
              <NotificationBell />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            background: theme.palette.background.default,
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default LegalLayout; 