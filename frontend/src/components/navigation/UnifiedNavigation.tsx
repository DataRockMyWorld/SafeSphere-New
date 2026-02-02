import React, { useState, useCallback, useMemo } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import logo from '../../assets/logo.png';
import {
  FIXED_NAV_ITEMS,
  SIDEBAR_GROUPS,
  GROUP_SUBITEMS,
  SIDEBAR_STORAGE_KEY,
  DEFAULT_EXPANDED_GROUPS,
  canSeeItem,
  getSubitemsKey,
} from './sidebarConfig';

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 72;

function loadExpandedGroups(): string[] {
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_EXPANDED_GROUPS;
}

function saveExpandedGroups(ids: string[]) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/** Resolve current section title for navbar breadcrumb */
function getBreadcrumbLabel(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/report-incident')) return 'Report Incident';
  if (pathname.startsWith('/incidents')) return 'Incidents & Near Misses';
  if (pathname.startsWith('/inspections')) return 'Inspections';
  if (pathname.startsWith('/objectives')) return 'Objectives & KPIs';
  if (pathname.startsWith('/trends')) return 'Trends';
  if (pathname.startsWith('/document-management')) return 'Documents';
  if (pathname.startsWith('/compliance')) return 'Compliance';
  if (pathname.startsWith('/risks')) return 'Risk';
  if (pathname.startsWith('/audit')) return 'Audits';
  if (pathname.startsWith('/ppe')) return 'PPE';
  if (pathname.startsWith('/admin')) return 'Administration';
  return 'SafeSphere';
}

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

  const userRole = (user?.position ?? '').toUpperCase();
  const isAdmin = Boolean(user?.is_superuser);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(loadExpandedGroups);
  const [expandedGroupItems, setExpandedGroupItems] = useState<Record<string, boolean>>({});

  const visibleGroups = useMemo(
    () =>
      SIDEBAR_GROUPS.filter(
        (g) => g.id !== 'administration' || isAdmin
      ),
    [isAdmin]
  );

  // Auto-expand group and parent item that contain the current path
  React.useEffect(() => {
    const path = location.pathname;
    for (const group of visibleGroups) {
      for (const item of group.items) {
        const subKey = getSubitemsKey(group.id, item.path);
        const subitems = subKey ? GROUP_SUBITEMS[subKey] : null;
        const pathMatchesItem = path === item.path || (item.path !== '/' && path.startsWith(item.path + '/'));
        const pathMatchesSub = subitems?.some((s) => path === s.path || (s.path !== '/' && path.startsWith(s.path + '/')));
        if (pathMatchesItem) {
          setExpandedGroups((prev) => (prev.includes(group.id) ? prev : [...prev, group.id]));
          if (subKey) setExpandedGroupItems((prev) => ({ ...prev, [`${group.id}-${item.path}`]: true }));
          return;
        }
        if (pathMatchesSub) {
          setExpandedGroups((prev) => (prev.includes(group.id) ? prev : [...prev, group.id]));
          setExpandedGroupItems((prev) => ({ ...prev, [`${group.id}-${item.path}`]: true }));
          return;
        }
      }
    }
  }, [location.pathname, visibleGroups]);

  const handleGroupToggle = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];
      saveExpandedGroups(next);
      return next;
    });
  }, []);

  const handleGroupItemExpand = useCallback((key: string) => {
    setExpandedGroupItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
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

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isCurrentPath = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

  const breadcrumbLabel = useMemo(() => getBreadcrumbLabel(location.pathname), [location.pathname]);

  const navButtonSx = {
    borderRadius: 1,
    mx: 1,
    mb: 0.5,
    '&:hover': { background: alpha(theme.palette.primary.main, 0.08) },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.16) },
    },
  };

  const renderNavItem = (
    item: { title: string; path: string; icon: React.ReactNode; requiresRole?: string[] },
    options: { indent?: boolean; showLabel?: boolean }
  ) => {
    if (!canSeeItem(item, userRole, isAdmin)) return null;
    const { indent = false, showLabel = true } = options;
    const content = (
      <ListItemButton
        onClick={() => handleNavigation(item.path)}
        selected={isCurrentPath(item.path)}
        sx={{ ...navButtonSx, pl: indent ? 4 : 2, py: 1.25 }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: drawerOpen ? 40 : 0 }}>
          {item.icon}
        </ListItemIcon>
        {drawerOpen && showLabel && (
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isCurrentPath(item.path) ? 700 : 500,
            }}
          />
        )}
      </ListItemButton>
    );
    if (!drawerOpen) {
      return (
        <Tooltip key={item.path} title={item.title} placement="right">
          {content}
        </Tooltip>
      );
    }
    return <Box key={item.path}>{content}</Box>;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: drawerOpen ? 'space-between' : 'center',
          borderBottom: `1px solid ${alpha('#ffffff', 0.12)}`,
          minHeight: 64,
          background: theme.palette.primary.main,
          boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        {drawerOpen ? (
          <>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              <Box
                component="img"
                src={logo}
                alt="SafeSphere"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: `2px solid ${alpha('#ffffff', 0.3)}`,
                }}
              />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.5px' }}>
                SafeSphere
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }} aria-label="Toggle sidebar">
              <MenuIcon />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }} aria-label="Expand sidebar">
            <Box component="img" src={logo} alt="SafeSphere" sx={{ width: 32, height: 32, borderRadius: '50%' }} />
          </IconButton>
        )}
      </Box>

      {/* Fixed items: Dashboard, Report Incident, My Actions (always visible; when collapsed, icon + tooltip) */}
      <Box sx={{ px: 1, pt: 2 }}>
        {FIXED_NAV_ITEMS.map((item) => {
          if (!canSeeItem(item, userRole, isAdmin)) return null;
          const content = (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={isCurrentPath(item.path)}
              sx={navButtonSx}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: drawerOpen ? 40 : 0 }}>
                {item.icon}
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isCurrentPath(item.path) ? 700 : 500,
                    fontSize: '0.9rem',
                  }}
                />
              )}
            </ListItemButton>
          );
          if (!drawerOpen) {
            return (
              <Tooltip key={item.path} title={item.title} placement="right">
                <span>{content}</span>
              </Tooltip>
            );
          }
          return <React.Fragment key={item.path}>{content}</React.Fragment>;
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Collapsible groups (hidden when sidebar collapsed to keep focus on Dashboard / Report Incident) */}
      {drawerOpen && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 1, pb: 2 }}>
          {visibleGroups.map((group) => {
            const isGroupExpanded = expandedGroups.includes(group.id);
            const visibleItems = group.items.filter((item) => canSeeItem(item, userRole, isAdmin));
            if (visibleItems.length === 0) return null;

            return (
              <Box key={group.id} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleGroupToggle(group.id)}
                  sx={{
                    ...navButtonSx,
                    py: 1,
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {isGroupExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={group.label}
                    primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                </ListItemButton>
                <Collapse in={isGroupExpanded} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {visibleItems.map((item) => {
                      const subKey = getSubitemsKey(group.id, item.path);
                      const subitems = subKey ? GROUP_SUBITEMS[subKey] : null;
                      const hasSubitems = subitems && subitems.filter((s) => canSeeItem(s, userRole, isAdmin)).length > 0;
                      const itemExpandKey = `${group.id}-${item.path}`;
                      const isItemExpanded = expandedGroupItems[itemExpandKey];

                      if (hasSubitems && subitems) {
                        const visibleSub = subitems.filter((s) => canSeeItem(s, userRole, isAdmin));
                        return (
                          <Box key={item.path}>
                            <ListItemButton
                              onClick={() => handleGroupItemExpand(itemExpandKey)}
                              sx={{ ...navButtonSx, pl: 3, py: 0.75 }}
                            >
                              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                                {item.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{ fontSize: '0.85rem' }}
                              />
                              {isItemExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                            </ListItemButton>
                            <Collapse in={isItemExpanded} timeout="auto" unmountOnExit>
                              <List disablePadding>
                                {visibleSub.map((sub) => renderNavItem(sub, { indent: true }))}
                              </List>
                            </Collapse>
                          </Box>
                        );
                      }
                      return renderNavItem(item, { indent: true });
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      )}

      <Divider />

      {/* User profile */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleUserMenuOpen}
          sx={{
            borderRadius: 1,
            background: alpha(theme.palette.primary.main, 0.08),
            '&:hover': { background: alpha(theme.palette.primary.main, 0.12) },
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
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'white',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
          }}
        >
          <Toolbar sx={{ minHeight: '52px !important', px: { xs: 1.5, sm: 2.5 } }}>
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 2, color: theme.palette.text.primary }} aria-label="Menu">
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              {breadcrumbLabel}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <NotificationBell />
          </Toolbar>
        </AppBar>

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

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: { mt: 1, minWidth: 200, borderRadius: 1, boxShadow: theme.shadows[8] },
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
