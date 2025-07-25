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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  Business as DepartmentIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  lockedAccounts: number;
  totalDepartments: number;
  recentLogins: number;
  pendingNotifications: number;
  systemHealth: 'good' | 'warning' | 'error';
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would fetch this data from your API
        // For now, we'll simulate the data
        const mockMetrics: SystemMetrics = {
          totalUsers: 45,
          activeUsers: 38,
          lockedAccounts: 2,
          totalDepartments: 4,
          recentLogins: 12,
          pendingNotifications: 8,
          systemHealth: 'good',
        };

        const mockActivity: RecentActivity[] = [
          {
            id: 1,
            user: 'John Doe',
            action: 'User account created',
            timestamp: '2 minutes ago',
            status: 'success',
          },
          {
            id: 2,
            user: 'Jane Smith',
            action: 'Password reset requested',
            timestamp: '5 minutes ago',
            status: 'warning',
          },
          {
            id: 3,
            user: 'Mike Johnson',
            action: 'Account locked due to failed attempts',
            timestamp: '10 minutes ago',
            status: 'error',
          },
          {
            id: 4,
            user: 'Sarah Wilson',
            action: 'Department updated',
            timestamp: '15 minutes ago',
            status: 'success',
          },
        ];

        setMetrics(mockMetrics);
        setRecentActivity(mockActivity);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.first_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your SafeSphere system today.
        </Typography>
      </Box>

      {/* System Health Status */}
      <Box sx={{ mb: 4 }}>
        <Paper
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Status: Healthy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All systems are operating normally. No critical issues detected.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics?.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics?.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.warning.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics?.lockedAccounts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Locked Accounts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.info.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <DepartmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metrics?.totalDepartments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Departments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: alpha(getStatusColor(activity.status), 0.1) }}>
                          {getStatusIcon(activity.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {activity.user}
                            </Typography>
                            <Chip
                              label={activity.status}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getStatusColor(activity.status), 0.1),
                                color: getStatusColor(activity.status),
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
                  icon={<PeopleIcon />}
                  label="Create New User"
                  clickable
                  sx={{
                    justifyContent: 'flex-start',
                    height: 48,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<DepartmentIcon />}
                  label="Manage Departments"
                  clickable
                  sx={{
                    justifyContent: 'flex-start',
                    height: 48,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<SecurityIcon />}
                  label="Security Settings"
                  clickable
                  sx={{
                    justifyContent: 'flex-start',
                    height: 48,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<NotificationsIcon />}
                  label="System Notifications"
                  clickable
                  sx={{
                    justifyContent: 'flex-start',
                    height: 48,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 