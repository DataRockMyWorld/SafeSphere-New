import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
  IconButton,
  useMediaQuery,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  alpha,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  Gavel as LegalIcon,
  Engineering as PPEIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle,
  Menu as MenuIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  CheckCircleOutline as ApprovalIcon,
  Assignment as AssignmentIcon,
  Archive as RecordsIcon,
  LowPriority as ChangeRequestIcon,
  Scale as LegalScaleIcon,
  Policy as PolicyIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  LibraryBooks as LibraryIcon,
  ShoppingCart as PurchasesIcon,
  AssignmentReturn as ReturnsIcon,
  ReportProblem as DamageReportsIcon,
  LocalShipping as VendorsIcon,
  Assignment as RequestsIcon,
  AssignmentInd as IssuanceIcon,
  Inventory2 as StockIcon,
  BusinessCenter as DepartmentIcon,
  VpnKey as SecuritySettingsIcon,
  Tune as SystemSettingsIcon,
  Schedule as ScheduleIcon,
  FindInPage as FindingsIcon,
  AssignmentTurnedIn as CAPAIcon,
  TableChart as AuditTableIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import logo from '../../assets/logo.png';

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 80;

// All available modules
const ALL_MODULES = [
  {
    id: 'document-management',
    title: 'Document Management',
    icon: <DocumentIcon />,
    path: '/document-management',
    items: [
      { title: 'Library', icon: <LibraryIcon />, path: '/document-management/library' },
      { title: 'Records', icon: <RecordsIcon />, path: '/document-management/records' },
      { title: 'Document Matrix', icon: <ReportIcon />, path: '/document-management/matrix' },
      { title: 'Change Requests', icon: <ChangeRequestIcon />, path: '/document-management/change-request-management' },
      { title: 'Approvals', icon: <ApprovalIcon />, path: '/document-management/approvals' },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: <LegalIcon />,
    path: '/compliance',
    items: [
      { title: 'Obligations', icon: <LegalScaleIcon />, path: '/compliance/register', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Annual Review', icon: <HistoryIcon />, path: '/compliance/review', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Calendar', icon: <ScheduleIcon />, path: '/compliance/calendar', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Evidence', icon: <DocumentIcon />, path: '/compliance/evidence', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Law Library', icon: <LibraryIcon />, path: '/compliance/library' }, // Available to all users (read-only)
      { title: 'Change Tracker', icon: <PolicyIcon />, path: '/compliance/tracker', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    ],
  },
  {
    id: 'ppe',
    title: 'PPE Management',
    icon: <PPEIcon />,
    path: '/ppe',
    items: [
      { title: 'PPE Register', icon: <AssignmentIcon />, path: '/ppe/register', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Stock Position', icon: <StockIcon />, path: '/ppe/stock-position', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Inventory', icon: <InventoryIcon />, path: '/ppe/inventory', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Purchases', icon: <PurchasesIcon />, path: '/ppe/purchases', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Vendors', icon: <VendorsIcon />, path: '/ppe/vendors', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Requests', icon: <RequestsIcon />, path: '/ppe/requests' }, // Available to all users - can make requests
      { title: 'Issuance', icon: <IssuanceIcon />, path: '/ppe/issuance', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Returns', icon: <ReturnsIcon />, path: '/ppe/returns', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
      { title: 'Damage Reports', icon: <DamageReportsIcon />, path: '/ppe/damage-reports' }, // Available to all users - can report damage
      { title: 'Settings', icon: <SettingsIcon />, path: '/ppe/settings', requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    ],
  },
  {
    id: 'audit',
    title: 'Audit Management',
    icon: <AssignmentIcon />,
    path: '/audit',
    requiresRole: ['HSSE MANAGER', 'ADMIN'], // Entire module restricted to HSSE Manager/Admin
    items: [
      { title: 'Audit Planner', icon: <ScheduleIcon />, path: '/audit/planner' },
      { title: 'Findings', icon: <FindingsIcon />, path: '/audit/findings' },
      { title: 'Management Review', icon: <AssignmentIcon />, path: '/audit/management-review' },
      { title: 'CAPAs', icon: <CAPAIcon />, path: '/audit/capas' },
      { title: 'Audit Table', icon: <AuditTableIcon />, path: '/audit/table' },
      { title: 'Reports', icon: <ReportIcon />, path: '/audit/reports' },
    ],
  },
  {
    id: 'risk',
    title: 'Risk Management',
    icon: <AssignmentIcon />,
    path: '/risks',
    items: [
      { title: 'Risk Matrix', icon: <DashboardIcon />, path: '/risks/matrix' }, // Available to all users (read-only)
      { title: 'Risk Register', icon: <AssignmentIcon />, path: '/risks/register' }, // Available to all users (read-only)
    ],
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    icon: <AdminIcon />,
    path: '/admin',
    items: [
      { title: 'Users', icon: <PersonIcon />, path: '/admin/users' },
      { title: 'Departments', icon: <DepartmentIcon />, path: '/admin/departments' },
      { title: 'Security', icon: <SecuritySettingsIcon />, path: '/admin/security' },
      { title: 'Settings', icon: <SystemSettingsIcon />, path: '/admin/settings' },
    ],
  },
];

interface UnifiedNavigationProps {
  children: React.ReactNode;
  currentModule?: string;
}

const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Find current module based on path
  const getCurrentModule = () => {
    return ALL_MODULES.find(module => location.pathname.startsWith(module.path));
  };

  const activeModule = getCurrentModule();

  // Auto-expand current module
  React.useEffect(() => {
    if (activeModule && !expandedModules.includes(activeModule.id)) {
      setExpandedModules([activeModule.id]);
    }
  }, [activeModule]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
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

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Logo and Toggle */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: drawerOpen ? 'space-between' : 'center',
          borderBottom: `1px solid ${alpha('#ffffff', 0.15)}`,
          minHeight: 72,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.12)}`,
        }}
      >
        {drawerOpen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <Box
                component="img"
                src={logo}
                alt="SafeSphere"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `2px solid ${alpha('#ffffff', 0.3)}`,
                }}
              />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.5px' }}>
                SafeSphere
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <Box component="img" src={logo} alt="SafeSphere" sx={{ width: 32, height: 32, borderRadius: '50%' }} />
          </IconButton>
        )}
      </Box>

      {/* Dashboard Button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => handleNavigation('/dashboard')}
          sx={{
            borderRadius: 0,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.08),
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.text.secondary, minWidth: drawerOpen ? 40 : 0 }}>
            <DashboardIcon />
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText 
              primary="Dashboard"
              primaryTypographyProps={{
                fontWeight: isCurrentPath('/dashboard') ? 700 : 400,
              }}
            />
          )}
        </ListItemButton>
      </Box>

      <Divider />

      {/* Modules Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List sx={{ px: 2 }}>
          {ALL_MODULES
            .filter((module: any) => {
              // Filter entire modules based on role requirements
              if (!module.requiresRole) return true; // No role requirement, show to all
              const userRole = user?.position?.toUpperCase() || '';
              const isAdmin = user?.is_superuser || false;
              return (
                module.requiresRole.includes(userRole) ||
                (isAdmin && module.requiresRole.includes('ADMIN'))
              );
            })
            .map((module) => {
            const isExpanded = expandedModules.includes(module.id);
            const isModuleActive = activeModule?.id === module.id;

            return (
              <Box key={module.id} sx={{ mb: 1 }}>
                {/* Module Header */}
                <ListItemButton
                  onClick={() => {
                    if (drawerOpen) {
                      handleModuleExpand(module.id);
                    } else {
                      handleNavigation(module.path);
                    }
                  }}
                  sx={{
                    borderRadius: 0,
                    mb: 0.5,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.08),
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.text.secondary, minWidth: drawerOpen ? 40 : 0 }}>
                    {module.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <>
                      <ListItemText 
                        primary={module.title}
                        primaryTypographyProps={{
                          fontWeight: isModuleActive ? 700 : 500,
                          fontSize: '0.9rem',
                        }}
                      />
                      {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </>
                  )}
                </ListItemButton>

                {/* Module Items - Only show when drawer is open and module is expanded */}
                {drawerOpen && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {module.items
                        .filter((item: any) => {
                          // Filter items based on role requirements
                          if (!item.requiresRole) return true; // No role requirement, show to all
                          const userRole = user?.position?.toUpperCase() || '';
                          const isAdmin = user?.is_superuser || false;
                          return (
                            item.requiresRole.includes(userRole) ||
                            (isAdmin && item.requiresRole.includes('ADMIN'))
                          );
                        })
                        .map((item: any) => (
                        <ListItemButton
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          selected={isCurrentPath(item.path)}
                          sx={{
                            pl: 4,
                            py: 1,
                            borderRadius: 0,
                            ml: 2,
                            mb: 0.5,
                            '&.Mui-selected': {
                              backgroundColor: 'transparent',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              },
                            },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: theme.palette.text.secondary }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.title}
                            primaryTypographyProps={{
                              fontSize: '0.85rem',
                              fontWeight: isCurrentPath(item.path) ? 700 : 400,
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleUserMenuOpen}
          sx={{
            borderRadius: 0,
            background: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: drawerOpen ? 40 : 0 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.first_name?.charAt(0) || 'U'}
            </Avatar>
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText
              primary={`${user?.first_name || 'User'} ${user?.last_name || ''}`}
              secondary={user?.email}
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

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
          width: drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            borderRadius: 0,
            boxShadow: `2px 0 8px ${alpha(theme.palette.common.black, 0.04)}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { 
            md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'white',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3 } }}>
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 2, color: theme.palette.text.primary }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Breadcrumb */}
            {activeModule && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main }}>
                  {activeModule.icon}
                </Box>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                  {activeModule.title}
                </Typography>
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Notification Bell */}
            <NotificationBell />
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
            p: { xs: 2, sm: 3, md: 4 },
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
            borderRadius: 0,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UnifiedNavigation;
