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
  LinearProgress,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  Gavel as LegalIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Update as UpdateIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface ComplianceMetrics {
  total_obligations: number;
  compliant: number;
  non_compliant: number;
  partial_compliance: number;
  overdue_items: number;
  due_this_month: number;
  regulatory_changes: number;
  compliance_rate: number;
}

interface UpcomingDeadline {
  id: number;
  title: string;
  due_date: string;
  owner: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  days_until_due: number;
}

interface RegulatoryUpdate {
  id: number;
  regulation: string;
  change_type: string;
  effective_date: string;
  impact_level: 'high' | 'medium' | 'low';
}

const ComplianceDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    total_obligations: 0,
    compliant: 0,
    non_compliant: 0,
    partial_compliance: 0,
    overdue_items: 0,
    due_this_month: 0,
    regulatory_changes: 0,
    compliance_rate: 0,
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch register entries for metrics
      const registerResponse = await axiosInstance.get('/legals/register-entries/');
      const entries = registerResponse.data.results || registerResponse.data;
      
      // Calculate metrics
      const compliant = entries.filter((e: any) => e.compliance_status === 'compliant').length;
      const nonCompliant = entries.filter((e: any) => e.compliance_status === 'non-compliant').length;
      const partial = entries.filter((e: any) => e.compliance_status === 'partial').length;
      const complianceRate = entries.length > 0 ? Math.round((compliant / entries.length) * 100) : 0;
      
      // Mock upcoming deadlines (in real app, fetch from API)
      const mockDeadlines: UpcomingDeadline[] = entries.slice(0, 5).map((entry: any, index: number) => ({
        id: entry.id,
        title: entry.title,
        due_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        owner: entry.owner_department,
        status: entry.compliance_status || 'partial',
        days_until_due: (index + 1) * 7,
      }));
      
      // Mock regulatory updates
      const mockUpdates: RegulatoryUpdate[] = [
        {
          id: 1,
          regulation: 'Environmental Protection Act Amendment',
          change_type: 'Amendment',
          effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          impact_level: 'high',
        },
        {
          id: 2,
          regulation: 'Workplace Safety Regulations Update',
          change_type: 'Update',
          effective_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          impact_level: 'medium',
        },
        {
          id: 3,
          regulation: 'Health and Safety Training Requirements',
          change_type: 'New Regulation',
          effective_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          impact_level: 'high',
        },
      ];

      setMetrics({
        total_obligations: entries.length,
        compliant,
        non_compliant: nonCompliant,
        partial_compliance: partial,
        overdue_items: Math.floor(Math.random() * 5), // Mock data
        due_this_month: mockDeadlines.filter(d => d.days_until_due <= 30).length,
        regulatory_changes: mockUpdates.length,
        compliance_rate: complianceRate,
      });
      
      setUpcomingDeadlines(mockDeadlines);
      setRegulatoryUpdates(mockUpdates);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return theme.palette.success.main;
      case 'non-compliant': return theme.palette.error.main;
      case 'partial': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', p: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            HSSE Compliance Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor regulatory compliance, track obligations, and manage HSSE requirements
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Compliance Rate
                  </Typography>
                  <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  {metrics.compliance_rate}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.compliance_rate}
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
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Overdue Items
                  </Typography>
                  <ErrorIcon sx={{ color: theme.palette.error.main }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                  {metrics.overdue_items}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Require immediate attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Due This Month
                  </Typography>
                  <CalendarIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  {metrics.due_this_month}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Upcoming deadlines
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Regulatory Changes
                  </Typography>
                  <UpdateIcon sx={{ color: theme.palette.info.main }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {metrics.regulatory_changes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Compliance Breakdown */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Compliance Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                      <Typography variant="body2">Compliant</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>{metrics.compliant}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                      <Typography variant="body2">Partial</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>{metrics.partial_compliance}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                      <Typography variant="body2">Non-Compliant</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>{metrics.non_compliant}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Deadlines
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/legal/calendar')}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    View Calendar
                  </Button>
                </Box>
                <List sx={{ p: 0 }}>
                  {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                    <React.Fragment key={deadline.id}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              backgroundColor: alpha(getStatusColor(deadline.status), 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ScheduleIcon sx={{ fontSize: 18, color: getStatusColor(deadline.status) }} />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={deadline.title}
                          secondary={`${deadline.owner} • Due ${formatDate(deadline.due_date)}`}
                          primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <Chip
                          label={`${deadline.days_until_due} days`}
                          size="small"
                          sx={{
                            backgroundColor: deadline.days_until_due <= 7 ? alpha(theme.palette.error.main, 0.1) :
                                           deadline.days_until_due <= 30 ? alpha(theme.palette.warning.main, 0.1) :
                                           alpha(theme.palette.success.main, 0.1),
                            color: deadline.days_until_due <= 7 ? theme.palette.error.main :
                                  deadline.days_until_due <= 30 ? theme.palette.warning.main :
                                  theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>
                      {index < 2 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Regulatory Updates */}
        <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Regulatory Updates & Changes
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/legal/tracker')}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={2}>
              {regulatoryUpdates.map((update) => (
                <Grid item xs={12} md={4} key={update.id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(getImpactColor(update.impact_level), 0.2)}`,
                      backgroundColor: alpha(getImpactColor(update.impact_level), 0.05),
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={update.change_type}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        label={update.impact_level.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getImpactColor(update.impact_level), 0.1),
                          color: getImpactColor(update.impact_level),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      {update.regulation}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Effective: {formatDate(update.effective_date)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ComplianceDashboard;

