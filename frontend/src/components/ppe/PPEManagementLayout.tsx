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
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  Assignment as AssignmentIcon,
  Report as ReportIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Business as VendorIcon,
  LocalShipping as PurchaseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usePPEPermissions } from '../../context/PPEPermissionContext';
import NotificationBell from '../NotificationBell';
import logo from '../../assets/logo.png';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

const menuItems = [
  {
    title: 'Dashboard',
    description: 'View PPE management overview and metrics',
    icon: <DashboardIcon />,
    path: '/ppe',
  },
  {
    title: 'PPE Register',
    description: 'Browse and manage all PPE categories and items',
    icon: <CategoryIcon />,
    path: '/ppe/register',
  },
  {
    title: 'Stock Position',
    description: 'View current stock levels and positions',
    icon: <AssessmentIcon />,
    path: '/ppe/stock-position',
  },
  {
    title: 'Inventory Management',
    description: 'Add and manage PPE inventory and stock',
    icon: <InventoryIcon />,
    path: '/ppe/inventory',
  },
  {
    title: 'Purchases',
    description: 'Manage PPE purchases and procurement',
    icon: <PurchaseIcon />,
    path: '/ppe/purchases',
  },
  {
    title: 'Vendors',
    description: 'Manage PPE vendors and suppliers',
    icon: <VendorIcon />,
    path: '/ppe/vendors',
  },
  {
    title: 'Stock Requests',
    description: 'Manage PPE requests and approvals',
    icon: <AssignmentIcon />,
    path: '/ppe/requests',
  },
  {
    title: 'Issuance',
    description: 'Issue PPE to employees and track assignments',
    icon: <PersonIcon />,
    path: '/ppe/issuance',
  },
  {
    title: 'Returns',
    description: 'Process PPE returns and disposals',
    icon: <ShoppingCartIcon />,
    path: '/ppe/returns',
  },
  {
    title: 'Damage Reports',
    description: 'Track and manage PPE damage reports',
    icon: <ReportIcon />,
    path: '/ppe/damage-reports',
  },
  {
    title: 'Settings',
    description: 'Configure PPE management settings',
    icon: <SettingsIcon />,
    path: '/ppe/settings',
  },
];

const PPEManagementLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { permissions, isHSSEManager } = usePPEPermissions();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(true);
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
    handleUserMenuClose();
    logout();
    navigate('/login');
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
                PPE
              </Typography>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
            <List sx={{ px: 1 }}>
              {menuItems
                .filter(item => {
                  // Filter menu items based on permissions
                  switch (item.path) {
                    case '/ppe/register':
                      return permissions.canManagePPERegister;
                    case '/ppe/stock-position':
                      return permissions.canManageStockPosition;
                    case '/ppe/inventory':
                      return permissions.canManageInventory;
                    case '/ppe/purchases':
                      return permissions.canManagePurchases;
                    case '/ppe/vendors':
                      return permissions.canManageVendors;
                    case '/ppe/settings':
                      return permissions.canManageSettings;
                    default:
                      return true; // Show all other items
                  }
                })
                .map((item, index) => (
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
                        disableHoverListener={!isDrawerCollapsed}
                      >
                        <ListItemButton
                          onClick={() => {
                            navigate(item.path);
                            if (isMobile) {
                              setMobileOpen(false);
                            }
                          }}
                          selected={location.pathname === item.path}
                          sx={{
                            minHeight: 48,
                            borderRadius: 2,
                            mx: 1,
                            px: isDrawerCollapsed ? 2 : 3,
                            py: 1.5,
                            '&.Mui-selected': {
                              background: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.15),
                              },
                            },
                            '&:hover': {
                              background: alpha(theme.palette.action.hover, 0.1),
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: isDrawerCollapsed ? 0 : 40,
                              color: 'inherit',
                              '& .MuiSvgIcon-root': {
                                fontSize: '1.25rem',
                              },
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          {!isDrawerCollapsed && (
                            <ListItemText
                              primary={item.title}
                              primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                    {index < menuItems.filter(item => {
                      switch (item.path) {
                        case '/ppe/register':
                          return permissions.canManagePPERegister;
                        case '/ppe/stock-position':
                          return permissions.canManageStockPosition;
                        case '/ppe/inventory':
                          return permissions.canManageInventory;
                        case '/ppe/purchases':
                          return permissions.canManagePurchases;
                        case '/ppe/vendors':
                          return permissions.canManageVendors;
                        case '/ppe/settings':
                          return permissions.canManageSettings;
                        default:
                          return true;
                      }
                    }).length - 1 && (
                      <Divider sx={{ my: 1, mx: 2, opacity: 0.1 }} />
                    )}
                  </React.Fragment>
                ))}
            </List>
          </Box>

          {/* User Section */}
          {!isDrawerCollapsed && (
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  background: alpha(theme.palette.action.hover, 0.1),
                  cursor: 'pointer',
                }}
                onClick={handleUserMenuOpen}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                    }}
                    noWrap
                  >
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                    }}
                    noWrap
                  >
                    {user?.position || 'User'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
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
                PPE Management
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

export default PPEManagementLayout; 