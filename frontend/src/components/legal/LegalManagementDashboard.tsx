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
  Alert,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
} from '@mui/material';
import {
  Gavel as LegalIcon,
  Policy as PolicyIcon,
  Assignment as FormsIcon,
  Scale as ScaleIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
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

const PAGE_SIZE = 10;

interface LegalMetrics {
  total_laws: number;
  total_categories: number;
  total_register_entries: number;
  total_trackers: number;
  compliance_rate: number;
  pending_reviews: number;
}

interface RecentActivity {
  id: number;
  title: string;
  action: string;
  performed_by: string;
  created_at: string;
  type: string;
}

interface DashboardData {
  metrics: LegalMetrics;
  recent_activities: RecentActivity[];
  category_breakdown: Record<string, number>;
  compliance_breakdown: Record<string, number>;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend?: string;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, trend, color, subtitle }) => {
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

const getStatusIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'created':
      return <DocumentIcon />;
    case 'updated':
      return <CheckCircleIcon />;
    case 'reviewed':
      return <ScaleIcon />;
    case 'approved':
      return <CheckCircleIcon />;
    case 'rejected':
      return <WarningIcon />;
    default:
      return <ScheduleIcon />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const LegalManagementDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch laws
      const lawsResponse = await axiosInstance.get('/legals/resources/');
      const laws = lawsResponse.data.results || lawsResponse.data;

      // Fetch categories
      const categoriesResponse = await axiosInstance.get('/legals/categories/');
      const categories = categoriesResponse.data;

      // Fetch register entries
      const registerResponse = await axiosInstance.get('/legals/register-entries/');
      const registerEntries = registerResponse.data.results || registerResponse.data;

      // Fetch trackers
      const trackersResponse = await axiosInstance.get('/legals/legislation-trackers/');
      const trackers = trackersResponse.data.results || trackersResponse.data;

      // Calculate metrics
      const totalLaws = laws.length;
      const totalCategories = categories.length;
      const totalRegisterEntries = registerEntries.length;
      const totalTrackers = trackers.length;

      // Calculate compliance rate (simplified)
      const compliantEntries = registerEntries.filter((entry: any) => 
        entry.compliance_status === 'compliant'
      ).length;
      const complianceRate = totalRegisterEntries > 0 
        ? Math.round((compliantEntries / totalRegisterEntries) * 100) 
        : 0;

      // Calculate pending reviews (simplified)
      const pendingReviews = registerEntries.filter((entry: any) => 
        entry.compliance_status === 'partial' || !entry.compliance_status
      ).length;

      // Category breakdown
      const categoryBreakdown = categories.reduce((acc: Record<string, number>, category: any) => {
        const lawsInCategory = laws.filter((law: any) => 
          law.category === category.id
        ).length;
        acc[category.name] = lawsInCategory;
        return acc;
      }, {});

      // Compliance breakdown
      const complianceBreakdown = {
        'Compliant': compliantEntries,
        'Non-Compliant': registerEntries.filter((entry: any) => 
          entry.compliance_status === 'non-compliant'
        ).length,
        'Partial': registerEntries.filter((entry: any) => 
          entry.compliance_status === 'partial'
        ).length,
      };

      // Recent activities (simplified - using laws as example)
      const recentActivities: RecentActivity[] = laws.slice(0, 10).map((law: any, index: number) => ({
        id: law.id,
        title: law.title,
        action: index % 3 === 0 ? 'Created' : index % 3 === 1 ? 'Updated' : 'Reviewed',
        performed_by: 'System',
        created_at: law.created_at || new Date().toISOString(),
        type: 'law',
      }));

      const metrics: LegalMetrics = {
        total_laws: totalLaws,
        total_categories: totalCategories,
        total_register_entries: totalRegisterEntries,
        total_trackers: totalTrackers,
        compliance_rate: complianceRate,
        pending_reviews: pendingReviews,
      };

      setDashboardData({
        metrics,
        recent_activities: recentActivities,
        category_breakdown: categoryBreakdown,
        compliance_breakdown: complianceBreakdown,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="info">No data available</Alert>
        </Container>
      </Box>
    );
  }

  // Prepare chart data
  const categoryData = Object.entries(dashboardData.category_breakdown).map(([name, value]) => ({
    name,
    value,
    color: theme.palette.primary.main,
  }));

  const complianceData = Object.entries(dashboardData.compliance_breakdown).map(([name, value]) => ({
    name,
    value,
    color: name === 'Compliant' ? theme.palette.success.main : 
           name === 'Non-Compliant' ? theme.palette.error.main : 
           theme.palette.warning.main,
  }));

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
              title="Total Laws"
              value={dashboardData.metrics.total_laws}
              icon={<LegalIcon sx={{ fontSize: 28 }} />}
              color="#f59e0b"
              subtitle="In law library"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Register Entries"
              value={dashboardData.metrics.total_register_entries}
              icon={<PolicyIcon sx={{ fontSize: 28 }} />}
              color="#8b5cf6"
              subtitle="Legal obligations"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Compliance Rate"
              value={`${dashboardData.metrics.compliance_rate}%`}
              icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
              color="#10b981"
              subtitle="Overall compliance"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Pending Reviews"
              value={dashboardData.metrics.pending_reviews}
              icon={<WarningIcon sx={{ fontSize: 28 }} />}
              color="#ef4444"
              subtitle="Require attention"
            />
          </Grid>

          {/* Charts Row */}
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
                    Laws by Category
                  </Typography>
                </Box>
                <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Laws']}
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
                    Compliance Status
                  </Typography>
                </Box>
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                        fill="url(#complianceGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
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
                    onClick={() => navigate('/legal/history')}
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
                          Item
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recent_activities.map((activity) => (
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
                                {activity.title}
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

export default LegalManagementDashboard;
