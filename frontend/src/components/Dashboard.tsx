import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Gavel as LegalIcon,
  Engineering as PPEIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as RecentIcon,
  ArrowForward as ArrowForwardIcon,
  Assignment as TaskIcon,
  Notifications as NotificationIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  trend?: number;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, subtitle, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: color,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28, color } })}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
              }}
            >
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ title, description, icon, color, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          borderColor: color,
          '& .action-icon': {
            background: color,
            color: 'white',
          },
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          className="action-icon"
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ArrowForwardIcon sx={{ color: theme.palette.text.secondary }} />
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Mock data - replace with real API calls
  const stats = {
    documents: {
      total: 156,
      pending: 12,
      approved: 138,
      rejected: 6,
      trend: 8,
    },
    legal: {
      total: 45,
      compliant: 42,
      review: 3,
      trend: 5,
    },
    ppe: {
      total: 1240,
      inStock: 1108,
      lowStock: 89,
      outOfStock: 43,
      trend: -3,
    },
    users: {
      total: 87,
      active: 82,
      inactive: 5,
      trend: 12,
    },
  };

  const recentActivity = [
    { id: 1, type: 'document', title: 'Safety Policy Updated', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'legal', title: 'New Regulation Added', time: '4 hours ago', status: 'info' },
    { id: 3, type: 'ppe', title: 'Low Stock Alert: Hard Hats', time: '5 hours ago', status: 'warning' },
    { id: 4, type: 'document', title: 'Emergency Procedure Approved', time: '1 day ago', status: 'success' },
    { id: 5, type: 'ppe', title: 'PPE Request Completed', time: '1 day ago', status: 'success' },
  ];

  const quickActions = [
    {
      title: 'Create Document',
      description: 'Start a new HSSE document',
      icon: <DocumentIcon />,
      color: theme.palette.primary.main,
      onClick: () => navigate('/document-management/library'),
    },
    {
      title: 'Legal Compliance',
      description: 'Check compliance status',
      icon: <LegalIcon />,
      color: theme.palette.warning.main,
      onClick: () => navigate('/legal/register'),
    },
    {
      title: 'PPE Inventory',
      description: 'Manage equipment stock',
      icon: <PPEIcon />,
      color: theme.palette.success.main,
      onClick: () => navigate('/ppe/inventory'),
    },
    {
      title: 'View Reports',
      description: 'Generate analytics',
      icon: <AssessmentIcon />,
      color: theme.palette.info.main,
      onClick: () => navigate('/document-management'),
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document': return <DocumentIcon />;
      case 'legal': return <LegalIcon />;
      case 'ppe': return <PPEIcon />;
      default: return <NotificationIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.first_name || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your HSSE management system today.
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Documents"
              value={stats.documents.total}
              icon={<DocumentIcon />}
              color={theme.palette.primary.main}
              trend={stats.documents.trend}
              subtitle={`${stats.documents.pending} pending approval`}
              onClick={() => navigate('/document-management/library')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Legal Items"
              value={stats.legal.total}
              icon={<LegalIcon />}
              color={theme.palette.warning.main}
              trend={stats.legal.trend}
              subtitle={`${stats.legal.review} need review`}
              onClick={() => navigate('/legal/register')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="PPE Items"
              value={stats.ppe.total}
              icon={<PPEIcon />}
              color={theme.palette.success.main}
              trend={stats.ppe.trend}
              subtitle={`${stats.ppe.lowStock} low stock items`}
              onClick={() => navigate('/ppe/stock-position')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats.users.active}
              icon={<PeopleIcon />}
              color={theme.palette.info.main}
              trend={stats.users.trend}
              subtitle={`${stats.users.total} total users`}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <QuickActionCard {...action} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <Button size="small" endIcon={<ArrowForwardIcon />}>
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: alpha(getStatusColor(activity.status), 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {React.cloneElement(getActivityIcon(activity.type), {
                              sx: { fontSize: 20, color: getStatusColor(activity.status) },
                            })}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.time}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  System Health
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Document Compliance</Typography>
                    <Typography variant="body2" fontWeight={600}>88%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={88}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.success.main,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Legal Compliance</Typography>
                    <Typography variant="body2" fontWeight={600}>93%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={93}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.success.main,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">PPE Availability</Typography>
                    <Typography variant="body2" fontWeight={600}>72%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={72}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.warning.main,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Pending Tasks
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.warning.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WarningIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                      <Typography variant="body2" fontWeight={600}>
                        12 Documents
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Awaiting your approval
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ErrorIcon sx={{ fontSize: 20, color: theme.palette.error.main }} />
                      <Typography variant="body2" fontWeight={600}>
                        3 Legal Items
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Compliance review needed
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.info.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TaskIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                      <Typography variant="body2" fontWeight={600}>
                        8 PPE Requests
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Pending fulfillment
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

