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
  Avatar,
  Menu,
  MenuItem,
  Badge,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as DepartmentIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Home as HomeIcon,
  Menu as MenuIcon,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

const menuItems = [
  {
    title: 'Dashboard',
    description: 'System overview and metrics',
    icon: <DashboardIcon />,
    path: '/admin',
  },
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    icon: <PeopleIcon />,
    path: '/admin/users',
  },
  {
    title: 'Departments',
    description: 'Manage departments and organizational structure',
    icon: <DepartmentIcon />,
    path: '/admin/departments',
  },
  {
    title: 'System Security',
    description: 'Security settings and audit logs',
    icon: <SecurityIcon />,
    path: '/admin/security',
  },
  {
    title: 'System Settings',
    description: 'Configure system settings and preferences',
    icon: <SettingsIcon />,
    path: '/admin/settings',
  },
];

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleUserMenuClose();
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
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
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
                ADMIN
              </Typography>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List sx={{ p: 2 }}>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  <ListItem disablePadding>
                    <Tooltip
                      title={isMobile ? '' : item.description}
                      placement="right"
                      arrow
                    >
                      <ListItemButton
                        selected={location.pathname === item.path}
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
                            backgroundColor: alpha(theme.palette.error.main, 0.15),
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.2),
                            },
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.error.main,
                            },
                          },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                            transform: 'translateX(4px)',
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            justifyContent: 'center',
                            color: location.pathname === item.path ? theme.palette.error.main : theme.palette.text.secondary,
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: theme.palette.background.paper,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {menuItems.find(item => location.pathname === item.path)?.title || 'Admin Panel'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <HomeIcon />
              </IconButton>
              
              <NotificationBell />
              
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            background: theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminLayout; 