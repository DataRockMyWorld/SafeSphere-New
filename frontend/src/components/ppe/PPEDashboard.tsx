import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Alert,
  Paper,
  Stack,
  Badge,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Business as VendorIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Inventory2 as Inventory2Icon,
  Group as GroupIcon,
  Report as ReportIcon,
  Shield as ShieldIcon,
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePPEPermissions } from '../../context/PPEPermissionContext';
import axiosInstance from '../../utils/axiosInstance';

interface DashboardMetrics {
  totalCategories: number;
  totalVendors: number;
  totalPurchases: number;
  totalIssues: number;
  totalRequests: number;
  lowStockItems: number;
  expiringItems: number;
  totalInventoryValue: number;
  pendingRequests: number;
  activeUsers: number;
  monthlySpend: number;
  complianceRate: number;
  // User-specific metrics
  myPPEItems: number;
  myExpiringItems: number;
  myActiveItems: number;
  myComplianceRate: number;
}

interface StockPosition {
  ppe_category: {
    id: number;
    name: string;
    description: string;
  };
  total_received: number;
  total_issued: number;
  total_damaged: number;
  total_expired: number;
  current_stock: number;
  is_low_stock: boolean;
}

interface LowStockAlert {
  ppe_category: {
    id: number;
    name: string;
  };
  current_stock: number;
  threshold: number;
}

interface ExpiryAlert {
  ppe_issue: {
    id: number;
    employee: {
      first_name: string;
      last_name: string;
    };
    ppe_category: {
      name: string;
    };
    expiry_date: string;
  };
  days_until_expiry: number;
  is_expired: boolean;
}

interface RecentActivity {
  id: number;
  type: 'purchase' | 'issue' | 'request' | 'return' | 'damage';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'approved' | 'rejected';
  user: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PPEDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { permissions, isHSSEManager } = usePPEPermissions();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [stockPosition, setStockPosition] = useState<StockPosition[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openQuickActionsDialog, setOpenQuickActionsDialog] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine which endpoints to use based on user permissions
      const isHSSEManagerUser = user?.position === 'HSSE MANAGER' || user?.is_superuser;

      // Fetch stock position data
      const stockResponse = await axiosInstance.get('/ppes/dashboard/stock-position/');
      setStockPosition(stockResponse.data);

      // Fetch low stock alerts
      const lowStockResponse = await axiosInstance.get('/ppes/dashboard/low-stock-alerts/');
      setLowStockAlerts(lowStockResponse.data);

      // Fetch expiry alerts - filter for user if not HSSE Manager
      const expiryResponse = await axiosInstance.get('/ppes/dashboard/expiry-alerts/');
      let filteredExpiryAlerts = expiryResponse.data;
      
      if (!isHSSEManagerUser) {
        // Filter expiry alerts to show only current user's items
        filteredExpiryAlerts = expiryResponse.data.filter((alert: ExpiryAlert) => 
          alert.ppe_issue.employee.first_name === user?.first_name &&
          alert.ppe_issue.employee.last_name === user?.last_name
        );
      }
      setExpiryAlerts(filteredExpiryAlerts);

      // Fetch user-specific PPE data if not HSSE Manager
      let userPPEItems = 0;
      let userExpiringItems = 0;
      let userActiveItems = 0;
      
      if (!isHSSEManagerUser) {
        try {
          const userStockResponse = await axiosInstance.get('/ppes/dashboard/user-stock/');
          userPPEItems = userStockResponse.data.total_items || 0;
          userActiveItems = userStockResponse.data.ppe_items?.filter((item: any) => !item.is_expired).length || 0;
          userExpiringItems = userStockResponse.data.ppe_items?.filter((item: any) => 
            item.days_until_expiry <= 30 && item.days_until_expiry > 0
          ).length || 0;
        } catch (err) {
          console.error('Error fetching user stock data:', err);
        }
      }

      // Calculate metrics based on user role
      const calculatedMetrics: DashboardMetrics = {
        totalCategories: stockResponse.data.length,
        totalVendors: 0, // Will be fetched separately if needed
        totalPurchases: isHSSEManagerUser ? stockResponse.data.reduce((sum: number, item: StockPosition) => sum + item.total_received, 0) : 0,
        totalIssues: isHSSEManagerUser ? stockResponse.data.reduce((sum: number, item: StockPosition) => sum + item.total_issued, 0) : userPPEItems,
        totalRequests: 0, // Will be fetched separately if needed
        lowStockItems: isHSSEManagerUser ? lowStockResponse.data.length : 0,
        expiringItems: filteredExpiryAlerts.length,
        totalInventoryValue: 0, // Will be calculated if cost data is available
        pendingRequests: 0,
        activeUsers: 0,
        monthlySpend: 0,
        complianceRate: isHSSEManagerUser ? 95 : 100, // Mock data
        // User-specific metrics
        myPPEItems: userPPEItems,
        myExpiringItems: userExpiringItems,
        myActiveItems: userActiveItems,
        myComplianceRate: userActiveItems > 0 ? Math.round((userActiveItems / userPPEItems) * 100) : 100,
      };

      setMetrics(calculatedMetrics);

      // Generate user-specific recent activity
      const mockActivity: RecentActivity[] = isHSSEManagerUser ? [
        {
          id: 1,
          type: 'purchase',
          title: 'Safety Helmets Purchased',
          description: '50 units of safety helmets received from ABC Suppliers',
          timestamp: '2025-07-11T10:30:00Z',
          status: 'completed',
          user: 'John Smith'
        },
        {
          id: 2,
          type: 'issue',
          title: 'PPE Issued to Team',
          description: 'Safety glasses and gloves issued to construction team',
          timestamp: '2025-07-11T09:15:00Z',
          status: 'completed',
          user: 'Sarah Johnson'
        },
        {
          id: 3,
          type: 'request',
          title: 'New PPE Request',
          description: 'Request for additional safety vests',
          timestamp: '2025-07-11T08:45:00Z',
          status: 'pending',
          user: 'Mike Wilson'
        },
        {
          id: 4,
          type: 'return',
          title: 'PPE Returned',
          description: 'Damaged safety helmet returned for replacement',
          timestamp: '2025-07-10T16:20:00Z',
          status: 'completed',
          user: 'Lisa Brown'
        }
      ] : [
        {
          id: 1,
          type: 'issue',
          title: 'Safety Glasses Issued',
          description: 'Safety glasses issued to you',
          timestamp: '2025-07-11T09:15:00Z',
          status: 'completed',
          user: 'You'
        },
        {
          id: 2,
          type: 'request',
          title: 'PPE Request Submitted',
          description: 'Request for new safety helmet submitted',
          timestamp: '2025-07-10T14:30:00Z',
          status: 'pending',
          user: 'You'
        },
        {
          id: 3,
          type: 'return',
          title: 'Damaged PPE Returned',
          description: 'Damaged safety gloves returned for replacement',
          timestamp: '2025-07-09T11:20:00Z',
          status: 'completed',
          user: 'You'
        }
      ];
      setRecentActivity(mockActivity);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getMetricCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    color: string,
    subtitle?: string,
    trend?: { value: number; isPositive: boolean },
    onClick?: () => void
  ) => (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend.isPositive ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
              )}
              <Typography variant="caption" color={trend.isPositive ? 'success.main' : 'error.main'}>
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: color }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCartIcon />;
      case 'issue': return <PersonIcon />;
      case 'request': return <AssignmentIcon />;
      case 'return': return <CancelIcon />;
      case 'damage': return <WarningIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const filteredStockPosition = showLowStockOnly 
    ? stockPosition.filter(item => item.is_low_stock)
    : stockPosition;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 1, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
            backgroundClip: 'text', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '-0.025em',
          }}>
            PPE Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
            Welcome back, {user?.first_name}! {isHSSEManager 
              ? 'Here\'s your comprehensive PPE management overview.' 
              : 'Here\'s your personal PPE overview and safety compliance status.'
            }
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDashboardData} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenQuickActionsDialog(true)}
            sx={{ borderRadius: 2, fontFamily: '"Inter", sans-serif' }}
          >
            Quick Actions
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isHSSEManager ? (
          // HSSE Manager Metrics
          <>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'Total Categories',
                metrics?.totalCategories || 0,
                <CategoryIcon />,
                theme.palette.primary.main,
                'PPE categories',
                { value: 12, isPositive: true },
                () => navigate('/ppe/register')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'Total Purchases',
                metrics?.totalPurchases || 0,
                <ShoppingCartIcon />,
                theme.palette.success.main,
                'Items purchased',
                { value: 8, isPositive: true },
                () => navigate('/ppe/purchases')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'Total Issues',
                metrics?.totalIssues || 0,
                <PersonIcon />,
                theme.palette.info.main,
                'Items issued',
                { value: 15, isPositive: true },
                () => navigate('/ppe/issuance')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'Compliance Rate',
                `${metrics?.complianceRate || 95}%`,
                <SecurityIcon />,
                theme.palette.warning.main,
                'Safety compliance',
                { value: 3, isPositive: true }
              )}
            </Grid>
          </>
        ) : (
          // Regular User Metrics
          <>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'My PPE Items',
                metrics?.myPPEItems || 0,
                <ShieldIcon />,
                theme.palette.primary.main,
                'Your PPE items',
                { value: 5, isPositive: true },
                () => navigate('/ppe/issuance')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'Active Items',
                metrics?.myActiveItems || 0,
                <CheckCircleOutlineIcon />,
                theme.palette.success.main,
                'Currently active',
                { value: 8, isPositive: true }
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'Expiring Soon',
                metrics?.myExpiringItems || 0,
                <AccessTimeIcon />,
                theme.palette.warning.main,
                'Need renewal',
                { value: -2, isPositive: false },
                () => navigate('/ppe/issuance')
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {getMetricCard(
                'My Compliance',
                `${metrics?.myComplianceRate || 100}%`,
                <SecurityIcon />,
                theme.palette.info.main,
                'Your safety compliance',
                { value: 2, isPositive: true }
              )}
            </Grid>
          </>
        )}
      </Grid>

      {/* Alerts Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isHSSEManager ? (
          // HSSE Manager Alerts
          <>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                        <WarningIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        Low Stock Alerts
                      </Typography>
                    </Box>
                    <Badge badgeContent={lowStockAlerts.length} color="warning">
                      <NotificationsIcon />
                    </Badge>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main, fontFamily: '"Inter", sans-serif' }}>
                    {lowStockAlerts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                    Items need restocking
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/ppe/stock-position')}
                    sx={{ borderColor: theme.palette.warning.main, color: theme.palette.warning.main, fontFamily: '"Inter", sans-serif' }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                        <TrendingDownIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        Expiry Alerts
                      </Typography>
                    </Box>
                    <Badge badgeContent={expiryAlerts.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main, fontFamily: '"Inter", sans-serif' }}>
                    {expiryAlerts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                    Items expiring soon
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/ppe/issuance')}
                    sx={{ borderColor: theme.palette.error.main, color: theme.palette.error.main, fontFamily: '"Inter", sans-serif' }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                        <AssignmentIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        Pending Requests
                      </Typography>
                    </Box>
                    <Badge badgeContent={metrics?.pendingRequests || 0} color="info">
                      <NotificationsIcon />
                    </Badge>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main, fontFamily: '"Inter", sans-serif' }}>
                    {metrics?.pendingRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                    Awaiting approval
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/ppe/requests')}
                    sx={{ borderColor: theme.palette.info.main, color: theme.palette.info.main, fontFamily: '"Inter", sans-serif' }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          // Regular User Alerts
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                        <AccessTimeIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        My Expiring Items
                      </Typography>
                    </Box>
                    <Badge badgeContent={expiryAlerts.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main, fontFamily: '"Inter", sans-serif' }}>
                    {expiryAlerts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                    Your items expiring soon
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/ppe/issuance')}
                    sx={{ borderColor: theme.palette.error.main, color: theme.palette.error.main, fontFamily: '"Inter", sans-serif' }}
                  >
                    View My PPE
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                        <CheckCircleOutlineIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        My Active Items
                      </Typography>
                    </Box>
                    <Badge badgeContent={metrics?.myActiveItems || 0} color="success">
                      <NotificationsIcon />
                    </Badge>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main, fontFamily: '"Inter", sans-serif' }}>
                    {metrics?.myActiveItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                    Your active PPE items
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/ppe/issuance')}
                    sx={{ borderColor: theme.palette.success.main, color: theme.palette.success.main, fontFamily: '"Inter", sans-serif' }}
                  >
                    View My PPE
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Stock Overview" />
            <Tab label="Recent Activity" />
            <Tab label="Quick Actions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
              {isHSSEManager ? 'Stock Position Overview' : 'My PPE Overview'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isHSSEManager && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={showLowStockOnly}
                      onChange={(e) => setShowLowStockOnly(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show Low Stock Only"
                />
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(isHSSEManager ? '/ppe/stock-position' : '/ppe/issuance')}
                sx={{ fontFamily: '"Inter", sans-serif' }}
              >
                {isHSSEManager ? 'View All' : 'View My PPE'}
              </Button>
            </Box>
          </Box>
          
          {isHSSEManager ? (
            // HSSE Manager Stock Overview
            <Grid container spacing={2}>
              {filteredStockPosition.slice(0, 6).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.ppe_category.id}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        {item.ppe_category.name}
                      </Typography>
                      {item.is_low_stock && (
                        <Chip
                          label="Low Stock"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                      Current Stock: {item.current_stock}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((item.current_stock / (item.total_received || 1)) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                        Received: {item.total_received}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                        Issued: {item.total_issued}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Regular User PPE Overview
            <Grid container spacing={2}>
              {expiryAlerts.slice(0, 6).map((alert) => (
                <Grid item xs={12} sm={6} md={4} key={alert.ppe_issue.id}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                        {alert.ppe_issue.ppe_category.name}
                      </Typography>
                      <Chip
                        label={alert.is_expired ? 'Expired' : 'Expiring Soon'}
                        size="small"
                        color={alert.is_expired ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: '"Inter", sans-serif' }}>
                      Expires: {new Date(alert.ppe_issue.expiry_date).toLocaleDateString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min((alert.days_until_expiry / 365) * 100, 100))}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: alert.is_expired ? theme.palette.error.main : theme.palette.warning.main,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                        Days Left: {alert.days_until_expiry}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                        Status: {alert.is_expired ? 'Expired' : 'Active'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {expiryAlerts.length === 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif', mb: 1 }}>
                      All PPE Items Active
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                      Great job! All your PPE items are currently active and within expiry dates.
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: '"Inter", sans-serif' }}>
            Recent Activity
          </Typography>
          <List sx={{ py: 0 }}>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
                          {activity.title}
                        </Typography>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={getStatusColor(activity.status) as any}
                          icon={getStatusIcon(activity.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                          {activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            {activity.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: '"Inter", sans-serif' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {isHSSEManager ? (
              // HSSE Manager Quick Actions
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/purchases')}>
                    <ShoppingCartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      New Purchase
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/issuance')}>
                    <PersonIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Issue PPE
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/requests')}>
                    <AssignmentIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      View Requests
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/stock-position')}>
                    <InventoryIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Stock Report
                    </Typography>
                  </Card>
                </Grid>
              </>
            ) : (
              // Regular User Quick Actions
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/issuance')}>
                    <ShieldIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      View My PPE
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/requests')}>
                    <AssignmentIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Request PPE
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/returns')}>
                    <CancelIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Return PPE
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }} onClick={() => navigate('/ppe/damage-reports')}>
                    <WarningIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Report Damage
                    </Typography>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>
      </Card>

      {/* Quick Actions Dialog */}
      <Dialog open={openQuickActionsDialog} onClose={() => setOpenQuickActionsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Inter", sans-serif' }}>Quick Actions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {isHSSEManager ? (
              // HSSE Manager Quick Actions
              <>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/purchases');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    New Purchase Order
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/issuance');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    Issue PPE
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/requests');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    View Requests
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<InventoryIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/stock-position');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    Stock Report
                  </Button>
                </Grid>
              </>
            ) : (
              // Regular User Quick Actions
              <>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShieldIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/issuance');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    View My PPE
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/requests');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    Request PPE
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/returns');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    Return PPE
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<WarningIcon />}
                    onClick={() => {
                      setOpenQuickActionsDialog(false);
                      navigate('/ppe/damage-reports');
                    }}
                    sx={{ py: 2, fontFamily: '"Inter", sans-serif' }}
                  >
                    Report Damage
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuickActionsDialog(false)} sx={{ fontFamily: '"Inter", sans-serif' }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PPEDashboard; 