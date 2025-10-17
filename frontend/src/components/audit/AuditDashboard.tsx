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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Alert,
  Paper,
  Skeleton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Assignment as AuditIcon,
  FindInPage as FindingsIcon,
  AssignmentTurnedIn as CAPAIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
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
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface DashboardData {
  // Overall metrics
  total_audits: number;
  audits_this_year: number;
  completed_audits: number;
  in_progress_audits: number;
  scheduled_audits: number;
  
  // Findings
  total_findings: number;
  open_findings: number;
  major_ncs: number;
  minor_ncs: number;
  observations: number;
  
  // CAPAs
  total_capas: number;
  open_capas: number;
  overdue_capas: number;
  capa_completion_rate: number;
  
  // Compliance
  average_compliance_score: number;
  compliance_trend: Array<{ month: string; score: number }>;
  
  // By clause
  findings_by_clause: Record<string, number>;
  compliance_by_clause: Record<string, number>;
  
  // Lists
  upcoming_audits: any[];
  recent_findings: any[];
  overdue_capas_list: any[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  subtitle?: string;
  trend?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle, trend, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
        } : {},
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.text.primary, 0.7),
                fontWeight: 500,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: color,
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: alpha(theme.palette.text.primary, 0.6) }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
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
        </Box>
      </CardContent>
    </Card>
  );
};

const AuditDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/audits/dashboard/');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Error fetching audit dashboard:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  if (error) {
    return (
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
    );
  }
  
  if (!data) return null;
  
  // Prepare chart data
  const findingsBreakdownData = [
    { name: 'Major NCs', value: data.major_ncs, color: theme.palette.error.main },
    { name: 'Minor NCs', value: data.minor_ncs, color: theme.palette.warning.main },
    { name: 'Observations', value: data.observations, color: theme.palette.info.main },
  ];
  
  const findingsByClauseData = Object.entries(data.findings_by_clause || {})
    .map(([clause, count]) => ({ clause, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10);
  
  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'MAJOR_NC':
        return theme.palette.error.main;
      case 'MINOR_NC':
        return theme.palette.warning.main;
      case 'OBSERVATION':
        return theme.palette.info.main;
      case 'OPPORTUNITY':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return theme.palette.error.dark;
      case 'HIGH':
        return theme.palette.error.main;
      case 'MEDIUM':
        return theme.palette.warning.main;
      case 'LOW':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  return (
    <Box>
      {/* Header Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Audit Management Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            ISO 45001:2018 Internal Audit System
          </Typography>
        </Box>
        <IconButton onClick={fetchDashboardData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Audits"
            value={data.total_audits}
            icon={<AuditIcon />}
            color={theme.palette.primary.main}
            subtitle={`${data.audits_this_year} this year`}
            onClick={() => navigate('/audit/table')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Findings"
            value={data.open_findings}
            icon={<FindingsIcon />}
            color={theme.palette.warning.main}
            subtitle={`${data.total_findings} total`}
            onClick={() => navigate('/audit/findings')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Overdue CAPAs"
            value={data.overdue_capas}
            icon={<WarningIcon />}
            color={theme.palette.error.main}
            subtitle={`${data.open_capas} open`}
            onClick={() => navigate('/audit/capas')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Compliance Score"
            value={`${data.average_compliance_score}%`}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
            subtitle="Average score"
          />
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Findings Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Findings Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={findingsBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {findingsBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Compliance Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Compliance Trend
              </Typography>
              {data.compliance_trend && data.compliance_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.compliance_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Compliance Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No compliance data available yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Findings by ISO Clause */}
      {findingsByClauseData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Findings by ISO 45001 Clause
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={findingsByClauseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="clause" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Lists Row */}
      <Grid container spacing={3}>
        {/* Upcoming Audits */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upcoming Audits
                </Typography>
                <Chip
                  label={data.upcoming_audits?.length || 0}
                  size="small"
                  color="primary"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.upcoming_audits && data.upcoming_audits.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {data.upcoming_audits.map((audit: any) => (
                    <ListItem
                      key={audit.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {audit.audit_code}
                            </Typography>
                            <Chip
                              label={audit.status}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {audit.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {audit.planned_start_date} - {audit.planned_end_date}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming audits scheduled
                  </Typography>
                  {user?.position === 'HSSE MANAGER' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/audit/planner')}
                    >
                      Schedule Audit
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Findings */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Findings
                </Typography>
                <Chip
                  label={data.recent_findings?.length || 0}
                  size="small"
                  color="warning"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.recent_findings && data.recent_findings.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {data.recent_findings.slice(0, 5).map((finding: any) => (
                    <ListItem
                      key={finding.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {finding.finding_code}
                            </Typography>
                            <Chip
                              label={finding.finding_type.replace('_', ' ')}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                bgcolor: alpha(getSeverityColor(finding.finding_type), 0.1),
                                color: getSeverityColor(finding.finding_type),
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {finding.title.substring(0, 60)}...
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.light, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No findings recorded
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Overdue CAPAs */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Overdue CAPAs
                </Typography>
                <Badge badgeContent={data.overdue_capas} color="error">
                  <WarningIcon color="action" />
                </Badge>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.overdue_capas_list && data.overdue_capas_list.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {data.overdue_capas_list.slice(0, 5).map((capa: any) => (
                    <ListItem
                      key={capa.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {capa.action_code}
                            </Typography>
                            <Chip
                              label={`${capa.days_overdue}d overdue`}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {capa.title.substring(0, 50)}...
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Assigned to: {capa.responsible_person_name}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.light, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    All CAPAs on track
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Audit Status Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Audit Status Overview
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completed Audits</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data.completed_audits} / {data.total_audits}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(data.completed_audits / data.total_audits) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">In Progress</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data.in_progress_audits}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(data.in_progress_audits / data.total_audits) * 100}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Scheduled</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data.scheduled_audits}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(data.scheduled_audits / data.total_audits) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* CAPA Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                CAPA Performance
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: data.capa_completion_rate >= 80 
                        ? theme.palette.success.main 
                        : data.capa_completion_rate >= 60 
                        ? theme.palette.warning.main 
                        : theme.palette.error.main
                    }}
                  >
                    {data.capa_completion_rate.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data.capa_completion_rate}
                  color={
                    data.capa_completion_rate >= 80 
                      ? 'success' 
                      : data.capa_completion_rate >= 60 
                      ? 'warning' 
                      : 'error'
                  }
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {data.total_capas - data.open_capas}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Closed CAPAs
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                      {data.overdue_capas}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Overdue
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditDashboard;

