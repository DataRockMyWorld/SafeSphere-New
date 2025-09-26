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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Description as DocumentIcon,
  ContentCopy as TemplateIcon,
  History as HistoryIcon,
  Approval as ApprovalIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  NotificationsActive as AlertIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as RecentIcon,
  Person as UserIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  LowPriority as ChangeRequestIcon,
  Archive as RecordsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axiosInstance from '../../utils/axiosInstance';

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
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.2),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2.5,
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
              color: 'white',
              boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -2,
                borderRadius: 2.5,
                padding: 2,
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.3)})`,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              }
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              size="small"
              icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
              label={trend}
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                '.MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
        </Box>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 1, 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                opacity: 0.8,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

interface RecentActivity {
  id: number;
  document_title: string;
  action: string;
  performed_by: string;
  created_at: string;
  comment: string;
}

interface DashboardData {
  metrics: {
    total_documents: number;
    pending_approvals: number;
    change_requests: number;
    approved_documents: number;
    rejected_documents: number;
    draft_documents: number;
  };
  document_types: {
    policy: number;
    system_document: number;
    procedure: number;
    form: number;
    ssow: number;
    other: number;
  };
  status_breakdown: {
    draft: number;
    hsse_review: number;
    ops_review: number;
    md_approval: number;
    approved: number;
    rejected: number;
  };
  recent_activities: RecentActivity[];
}

const DocumentManagementDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    const fetchDashboardData = async () => {
      try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/documents/dashboard/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'submit':
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case 'approve':
        return <ApprovedIcon sx={{ color: theme.palette.success.main }} />;
      case 'reject':
        return <RejectedIcon sx={{ color: theme.palette.error.main }} />;
      case 'verify':
        return <ApprovalIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <DocumentIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return <DocumentIcon />;
      case 'system_document':
        return <TemplateIcon />;
      case 'procedure':
        return <AssignmentIcon />;
      case 'form':
        return <RecordsIcon />;
      case 'ssow':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Prepare chart data
  const documentTypeData = dashboardData ? [
    { name: 'Policy', value: dashboardData.document_types.policy, color: theme.palette.primary.main },
    { name: 'System Document', value: dashboardData.document_types.system_document, color: theme.palette.secondary.main },
    { name: 'Procedure', value: dashboardData.document_types.procedure, color: theme.palette.success.main },
    { name: 'Form', value: dashboardData.document_types.form, color: theme.palette.warning.main },
    { name: 'SSOW', value: dashboardData.document_types.ssow, color: theme.palette.error.main },
    { name: 'Other', value: dashboardData.document_types.other, color: theme.palette.info.main },
  ] : [];

  const statusData = dashboardData ? [
    { name: 'Draft', value: dashboardData.status_breakdown.draft, color: theme.palette.grey[400] },
    { name: 'HSSE Review', value: dashboardData.status_breakdown.hsse_review, color: theme.palette.warning.main },
    { name: 'OPS Review', value: dashboardData.status_breakdown.ops_review, color: theme.palette.info.main },
    { name: 'MD Approval', value: dashboardData.status_breakdown.md_approval, color: theme.palette.secondary.main },
    { name: 'Approved', value: dashboardData.status_breakdown.approved, color: theme.palette.success.main },
    { name: 'Rejected', value: dashboardData.status_breakdown.rejected, color: theme.palette.error.main },
  ] : [];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={400} height={24} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
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

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh', 
      overflow: 'auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      position: 'relative',
    }}>
      <Box sx={{ p: 4 }}>

      <Grid container spacing={3}>
        {/* Top Row - Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Documents"
            value={dashboardData.metrics.total_documents}
            icon={<DocumentIcon />}
            color={theme.palette.primary.main}
            subtitle="All document types"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Approvals"
            value={dashboardData.metrics.pending_approvals}
            icon={<ApprovalIcon />}
            color={theme.palette.warning.main}
            subtitle="Requires attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Change Requests"
            value={dashboardData.metrics.change_requests}
            icon={<ChangeRequestIcon />}
            color={theme.palette.info.main}
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Approved Documents"
            value={dashboardData.metrics.approved_documents}
            icon={<ApprovedIcon />}
            color={theme.palette.success.main}
            subtitle="Successfully approved"
          />
        </Grid>

        {/* Document Types Doughnut Chart */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #8b5cf6, #a855f7)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    mr: 2,
                  }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: '1.25rem',
                  }}
                >
                  Document Types Distribution
                </Typography>
              </Box>
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {documentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Documents']}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        backdropFilter: 'blur(20px)',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: 20,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Document Status Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    mr: 2,
                  }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: '1.25rem',
                  }}
                >
                  Document Status Overview
                </Typography>
              </Box>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={alpha(theme.palette.divider, 0.3)}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        backdropFilter: 'blur(20px)',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#statusGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      mr: 2,
                    }}
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: '1.25rem',
                    }}
                  >
                    Recent Activity
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="medium"
                  endIcon={<HistoryIcon />}
                  onClick={() => navigate('/document-management/history')}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: theme.palette.primary.dark,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  View All
                </Button>
              </Box>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}>
                        Document
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}>
                        Action
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}>
                        Performed By
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}>
                        Time
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}>
                        Comment
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recent_activities.map((activity, index) => (
                      <TableRow 
                        key={activity.id} 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          },
                          '&:nth-of-type(even)': {
                            backgroundColor: alpha(theme.palette.grey[50], 0.3),
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                              mr: 2,
                              width: 36,
                              height: 36,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}>
                              {getStatusIcon(activity.action)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                              {activity.document_title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Chip
                            size="small"
                            label={activity.action}
                            sx={{
                              textTransform: 'capitalize',
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                              color: theme.palette.primary.main,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>
                            {activity.performed_by}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                              background: alpha(theme.palette.grey[100], 0.8),
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {formatTimeAgo(activity.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography 
                            variant="body2" 
                            color={theme.palette.text.secondary} 
                            sx={{ 
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontStyle: activity.comment ? 'normal' : 'italic',
                            }}
                          >
                            {activity.comment || 'No comment'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DocumentManagementDashboard; 