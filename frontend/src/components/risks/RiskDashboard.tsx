import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Assessment as RiskIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../utils/axiosInstance';

interface DashboardData {
  total_assessments: number;
  active_assessments: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  overdue_reviews: number;
  by_category: { [key: string]: number };
  pending_actions: number;
  overdue_actions: number;
}

const RiskDashboard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/risks/dashboard/');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading || !data) {
    return <LinearProgress />;
  }
  
  // Prepare chart data
  const riskDistributionData = [
    { name: 'Low', value: data.risk_distribution.low, color: '#388E3C' },
    { name: 'Medium', value: data.risk_distribution.medium, color: '#F57C00' },
    { name: 'High', value: data.risk_distribution.high, color: '#D32F2F' },
  ];
  
  const categoryData = Object.entries(data.by_category).map(([category, count]) => ({
    category: category.replace('_', ' '),
    count,
  }));
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
          Risk Management Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Comprehensive risk overview and analytics
        </Typography>
      </Box>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <RiskIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {data.total_assessments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assessments
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {data.active_assessments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                  }}
                >
                  <WarningIcon sx={{ fontSize: 32, color: theme.palette.warning.main }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {data.overdue_reviews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Reviews
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.error.main}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  <ErrorIcon sx={{ fontSize: 32, color: theme.palette.error.main }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    {data.risk_distribution.high}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Risks
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Risk Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Risk Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Risk by Category Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Risks by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Action Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Risk Treatment Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PendingIcon color="info" />
                      <Typography variant="body1">Pending Actions</Typography>
                    </Box>
                    <Chip 
                      label={data.pending_actions} 
                      color="info"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorIcon color="error" />
                      <Typography variant="body1">Overdue Actions</Typography>
                    </Box>
                    <Chip 
                      label={data.overdue_actions} 
                      color="error"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskDashboard;

