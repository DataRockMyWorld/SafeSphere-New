import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  Typography,
  useTheme,
  IconButton,
  useMediaQuery,
  Tooltip,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  alpha,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  Gavel as LegalIcon,
  Engineering as PPEIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Menu as MenuIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  CheckCircleOutline as ApprovalIcon,
  Assignment as FormsIcon,
  Assignment as AssignmentIcon,
  Archive as RecordsIcon,
  LowPriority as ChangeRequestIcon,
  Scale as LegalScaleIcon,
  Policy as PolicyIcon,
  AssignmentTurnedIn as LegalFormsIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import logo from '../../assets/logo.png';

const DRAWER_WIDTH = 80;
const EXPANDED_DRAWER_WIDTH = 280;

// Module-specific navigation items
const getModuleNavItems = (module: string) => {
  switch (module) {
    case 'Document Management':
      return [
        { title: 'Dashboard', icon: <DashboardIcon />, path: '/document-management' },
        { title: 'Library', icon: <DocumentIcon />, path: '/document-management/library' },
        { title: 'Records', icon: <RecordsIcon />, path: '/document-management/records' },
        { title: 'Change Requests', icon: <ChangeRequestIcon />, path: '/document-management/change-request-management' },
        { title: 'Approvals', icon: <ApprovalIcon />, path: '/document-management/approvals' },
        { title: 'History', icon: <HistoryIcon />, path: '/document-management/history' },
      ];
    case 'Legal Management':
      return [
        { title: 'Dashboard', icon: <DashboardIcon />, path: '/legal' },
        { title: 'Laws & Regulations', icon: <LegalScaleIcon />, path: '/legal/laws' },
        { title: 'Policies', icon: <PolicyIcon />, path: '/legal/policies' },
        { title: 'Forms', icon: <LegalFormsIcon />, path: '/legal/forms' },
      ];
    case 'PPE Management':
      return [
        { title: 'Dashboard', icon: <DashboardIcon />, path: '/ppe' },
        { title: 'Inventory', icon: <InventoryIcon />, path: '/ppe/inventory' },
        { title: 'Issuance', icon: <AssignmentIcon />, path: '/ppe/issuance' },
        { title: 'Maintenance', icon: <SettingsIcon />, path: '/ppe/maintenance' },
      ];
    case 'Admin Panel':
      return [
        { title: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { title: 'Users', icon: <PersonIcon />, path: '/admin/users' },
        { title: 'Groups', icon: <GroupIcon />, path: '/admin/groups' },
        { title: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
        { title: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
      ];
    default:
      return [];
  }
};

// Module colors
const getModuleColor = (module: string) => {
  switch (module) {
    case 'Document Management':
      return '#8b5cf6';
    case 'Legal Management':
      return '#f59e0b';
    case 'PPE Management':
      return '#10b981';
    case 'Admin Panel':
      return '#ef4444';
    default:
      return '#3b82f6';
  }
};

interface UnifiedNavigationProps {
  children: React.ReactNode;
  currentModule?: string;
}

const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ children, currentModule }) => {
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
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleItemClick = (item: any) => {
    navigate(item.path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getCurrentModuleInfo = () => {
    return { 
      title: currentModule || 'Dashboard', 
      color: getModuleColor(currentModule || 'Dashboard') 
    };
  };

  const currentModuleInfo = getCurrentModuleInfo();
  const moduleNavItems = getModuleNavItems(currentModule || 'Dashboard');

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
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            borderRadius: 0,
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
            overflow: 'visible',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* SafeSphere Logo at Top */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
              minHeight: 80,
              position: 'relative',
            }}
          >
            <Tooltip title="SafeSphere" placement="right" arrow>
              <Box
                component="img"
                src={logo}
                alt="SafeSphere Logo"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: `3px solid ${alpha('#ffffff', 0.2)}`,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    border: `3px solid ${alpha('#ffffff', 0.4)}`,
                  },
                }}
                onClick={() => navigate('/')}
              />
            </Tooltip>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
            <List sx={{ px: 1 }}>
              {moduleNavItems.map((item) => (
                <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip 
                    title={item.title}
                    placement="right"
                    arrow
                    sx={{
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: '#1e293b',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '12px 16px',
                        maxWidth: 200,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(20px)',
                        '& .MuiTooltip-arrow': {
                          color: '#1e293b',
                        },
                      },
                    }}
                  >
                    <ListItemButton
                      selected={isCurrentPath(item.path)}
                      onClick={() => handleItemClick(item)}
                      sx={{
                        minHeight: 56,
                        justifyContent: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 3,
                        mx: 1,
                        position: 'relative',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&.Mui-selected': {
                          background: `linear-gradient(135deg, ${currentModuleInfo.color}, ${alpha(currentModuleInfo.color, 0.8)})`,
                          color: 'white',
                          boxShadow: `0 8px 24px ${alpha(currentModuleInfo.color, 0.4)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${currentModuleInfo.color}, ${alpha(currentModuleInfo.color, 0.9)})`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 12px 32px ${alpha(currentModuleInfo.color, 0.5)}`,
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                        },
                        '&:hover': {
                          backgroundColor: alpha(currentModuleInfo.color, 0.15),
                          transform: 'translateY(-2px)',
                          '& .MuiListItemIcon-root': {
                            color: currentModuleInfo.color,
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          justifyContent: 'center',
                          color: isCurrentPath(item.path) ? 'white' : alpha('#ffffff', 0.7),
                          fontSize: '1.5rem',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* User Profile Section */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
            }}
          >
            <Tooltip 
              title={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {user?.email}
                  </Typography>
                </Box>
              }
              placement="right"
              arrow
            >
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${currentModuleInfo.color}, ${alpha(currentModuleInfo.color, 0.8)})`,
                  color: 'white',
                  boxShadow: `0 4px 16px ${alpha(currentModuleInfo.color, 0.4)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 8px 24px ${alpha(currentModuleInfo.color, 0.6)}`,
                  },
                }}
              >
                <AccountCircle sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
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
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        {/* Top App Bar - Minimal */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'transparent',
            color: theme.palette.text.primary,
            width: '100%',
            minHeight: 0,
            height: 0,
          }}
        >
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            width: '100%',
            height: '100vh',
            position: 'relative',
          }}
        >
          {children}
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
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UnifiedNavigation;
