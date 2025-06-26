import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  alpha,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Divider,
} from '@mui/material';
import {
  Description as DocumentIcon,
  ContentCopy as TemplateIcon,
  History as HistoryIcon,
  Approval as ApprovalIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  NotificationsActive as AlertIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as RecentIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3 }}>
        <IconButton
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            width: 64,
            height: 64,
            mb: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          {icon}
        </IconButton>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color, subtitle }) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              width: 48,
              height: 48,
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              size="small"
              icon={<TrendingUpIcon />}
              label={trend}
              sx={{
                ml: 'auto',
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                '.MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  user: string;
  timestamp: string;
  status: string;
}

const DocumentManagementDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalDocuments: 0,
    pendingApprovals: 0,
    recentRequests: 0,
    documentTypes: { hsse: 0, safety: 0, compliance: 0, other: 0 },
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Simulated API calls - replace with actual API endpoints
    const fetchDashboardData = async () => {
      try {
        // const response = await axios.get('/api/dashboard/metrics');
        // setMetrics(response.data);
        
        // Simulated data
        setMetrics({
          totalDocuments: 156,
          pendingApprovals: 8,
          recentRequests: 23,
          documentTypes: { hsse: 45, safety: 38, compliance: 52, other: 21 },
        });

        setRecentActivities([
          {
            id: 1,
            type: 'approval',
            title: 'Safety Protocol Update 2024',
            user: 'John Smith',
            timestamp: '2 hours ago',
            status: 'pending',
          },
          {
            id: 2,
            type: 'document',
            title: 'Emergency Response Plan',
            user: 'Sarah Johnson',
            timestamp: '4 hours ago',
            status: 'approved',
          },
          {
            id: 3,
            type: 'request',
            title: 'Chemical Storage Guidelines',
            user: 'Mike Wilson',
            timestamp: '6 hours ago',
            status: 'rejected',
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case 'approved':
        return <ApprovedIcon sx={{ color: theme.palette.success.main }} />;
      case 'rejected':
        return <RejectedIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <DocumentIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const services = [
    {
      title: 'Document Library',
      description: 'Access and manage all your documents in one place',
      icon: <DocumentIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents',
    },
    {
      title: 'Document Templates',
      description: 'Create and manage document templates for quick document creation',
      icon: <TemplateIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents/templates',
    },
    {
      title: 'Document History',
      description: 'View the complete history and version control of documents',
      icon: <HistoryIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents/history',
    },
    {
      title: 'Approval Workflow',
      description: 'Manage document approval processes and workflows',
      icon: <ApprovalIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents/approvals',
    },
    {
      title: 'Document Editor',
      description: 'Create and edit documents with our rich text editor',
      icon: <EditIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents/editor',
    },
    {
      title: 'Document Search',
      description: 'Advanced search functionality for finding documents quickly',
      icon: <SearchIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents/search',
    },
    {
      title: 'Document Settings',
      description: 'Configure document management preferences and settings',
      icon: <SettingsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      path: '/documents/settings',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor your document management metrics and activities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Top Row - Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Documents"
            value={metrics.totalDocuments}
            icon={<DocumentIcon />}
            trend="+12% this month"
            color={theme.palette.primary.main}
            subtitle="Across all categories"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Approvals"
            value={metrics.pendingApprovals}
            icon={<ApprovalIcon />}
            color={theme.palette.warning.main}
            subtitle="Requires immediate attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Recent Requests"
            value={metrics.recentRequests}
            icon={<AlertIcon />}
            trend="+5% this week"
            color={theme.palette.success.main}
            subtitle="Last 7 days"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value="24"
            icon={<UserIcon />}
            trend="+3 this week"
            color={theme.palette.info.main}
            subtitle="Currently working"
          />
        </Grid>

        {/* Middle Row - Document Types and Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Document Distribution</Typography>
                <Chip
                  label="Last 30 Days"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        HSSE Documents
                      </Typography>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {Math.round((metrics.documentTypes.hsse / metrics.totalDocuments) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.documentTypes.hsse / metrics.totalDocuments) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Safety Protocols
                      </Typography>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {Math.round((metrics.documentTypes.safety / metrics.totalDocuments) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.documentTypes.safety / metrics.totalDocuments) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main,
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Compliance Docs
                      </Typography>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {Math.round((metrics.documentTypes.compliance / metrics.totalDocuments) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.documentTypes.compliance / metrics.totalDocuments) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.warning.main,
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Other Documents
                      </Typography>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {Math.round((metrics.documentTypes.other / metrics.totalDocuments) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.documentTypes.other / metrics.totalDocuments) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.info.main,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DocumentIcon />}
                    onClick={() => navigate('/document-management/library')}
                    sx={{ textTransform: 'none' }}
                  >
                    New Document
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ApprovalIcon />}
                    onClick={() => navigate('/document-management/approvals')}
                    sx={{ textTransform: 'none' }}
                  >
                    Review
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RecentIcon />}
                    onClick={() => navigate('/document-management/history')}
                    sx={{ textTransform: 'none' }}
                  >
                    History
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UserIcon />}
                    onClick={() => navigate('/profile')}
                    sx={{ textTransform: 'none' }}
                  >
                    Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottom Row - Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button
                  variant="text"
                  size="small"
                  endIcon={<HistoryIcon />}
                  onClick={() => navigate('/document-management/history')}
                >
                  View All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {recentActivities.map((activity, index) => (
                  <Grid item xs={12} md={4} key={activity.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                            {getStatusIcon(activity.status)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                              {activity.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.user}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={activity.status}
                            color={
                              activity.status === 'approved'
                                ? 'success'
                                : activity.status === 'pending'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                          {activity.timestamp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentManagementDashboard; 