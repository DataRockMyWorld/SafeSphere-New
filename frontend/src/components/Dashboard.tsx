import React, { useEffect, useState, useMemo } from 'react';
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
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Gavel as LegalIcon,
  Engineering as PPEIcon,
  Assignment as AuditIcon,
  TrendingUp as RiskIcon,
  AdminPanelSettings as AdminIcon,
  HealthAndSafety as HealthSafetyIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

interface DocumentDashboardResponse {
  metrics: {
    total_documents: number;
    pending_approvals: number;
    approved_documents: number;
    draft_documents: number;
  };
  status_breakdown: {
    draft: number;
    hsse_review: number;
    ops_review: number;
    md_approval: number;
    approved: number;
    rejected: number;
  };
}

interface StockPositionItem {
  ppe_category: {
    id: number;
    name: string;
  };
  current_stock: number;
  is_low_stock: boolean;
}

interface CapaSummary {
  status: string;
  priority: string;
}

interface AppCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  requiresRole?: string[];
  gradient: string[];
  hasChart?: boolean;
  statValue?: number;
  statLabel?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [documentSummary, setDocumentSummary] = useState<DocumentDashboardResponse | null>(null);
  const [stockPosition, setStockPosition] = useState<StockPositionItem[]>([]);
  const [capas, setCapas] = useState<CapaSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const [documentResult, stockResult, capaResult] = await Promise.allSettled([
          axiosInstance.get<DocumentDashboardResponse>('/documents/dashboard/'),
          axiosInstance.get<StockPositionItem[]>('/ppes/dashboard/stock-position/'),
          axiosInstance.get<CapaSummary[]>('/audits/capas/my-capas/'),
        ]);

        if (!cancelled && documentResult.status === 'fulfilled') {
          setDocumentSummary(documentResult.value.data);
        }
        if (!cancelled && stockResult.status === 'fulfilled') {
          setStockPosition(stockResult.value.data);
        }
        if (!cancelled && capaResult.status === 'fulfilled') {
          setCapas(capaResult.value.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalDocuments = documentSummary?.metrics.total_documents ?? 0;
  const pendingApprovals = documentSummary?.metrics.pending_approvals ?? 0;
  const approvedDocuments = documentSummary?.metrics.approved_documents ?? 0;
  const lowStockCount = useMemo(
    () => stockPosition.filter((item) => item.is_low_stock).length,
    [stockPosition]
  );
  const openCapasCount = useMemo(
    () => capas.filter((capa) => !['CLOSED', 'VERIFIED'].includes(capa.status)).length,
    [capas]
  );

  // Chart data
  const documentStatusData = documentSummary?.status_breakdown
    ? [
        { name: 'Draft', value: documentSummary.status_breakdown.draft, color: theme.palette.info.main },
        { name: 'Review', value: documentSummary.status_breakdown.hsse_review + documentSummary.status_breakdown.ops_review + documentSummary.status_breakdown.md_approval, color: theme.palette.warning.main },
        { name: 'Approved', value: documentSummary.status_breakdown.approved, color: theme.palette.success.main },
        { name: 'Rejected', value: documentSummary.status_breakdown.rejected, color: theme.palette.error.main },
      ]
    : [];

  const capaPriorityData = useMemo(() => {
    const priorities = capas.reduce((acc, capa) => {
      const priority = capa.priority || 'MEDIUM';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(priorities).map(([name, value]) => ({ name, value }));
  }, [capas]);

  const lowStockData = useMemo(() => {
    return stockPosition
      .filter((item) => item.is_low_stock)
      .slice(0, 5)
      .map((item) => ({
        name: item.ppe_category.name.length > 12 
          ? item.ppe_category.name.substring(0, 12) + '...' 
          : item.ppe_category.name,
        stock: item.current_stock,
      }));
  }, [stockPosition]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const apps: AppCard[] = [
    {
      id: 'document-hub',
      title: 'Document Hub',
      description: 'Manage documents, records, and approvals',
      icon: <DocumentIcon />,
      path: '/document-management',
      gradient: [theme.palette.primary.main, theme.palette.primary.dark],
      hasChart: true,
      statValue: totalDocuments,
      statLabel: 'Total Documents',
    },
    {
      id: 'hs',
      title: 'H&S',
      description: 'Health & Safety overview',
      icon: <HealthSafetyIcon />,
      path: '/ppe',
      gradient: [theme.palette.success.main, theme.palette.success.dark],
      statValue: lowStockCount,
      statLabel: 'Low Stock Items',
    },
    {
      id: 'compliance',
      title: 'Compliance',
      description: 'Regulatory obligations',
      icon: <LegalIcon />,
      path: '/compliance',
      gradient: [theme.palette.info.main, theme.palette.info.dark],
    },
    {
      id: 'ppe',
      title: 'PPE Management',
      description: 'Inventory & stock control',
      icon: <PPEIcon />,
      path: '/ppe',
      gradient: [theme.palette.warning.main, theme.palette.warning.dark],
      hasChart: true,
      statValue: lowStockCount,
      statLabel: 'Low Stock',
    },
    {
      id: 'audit',
      title: 'Audit Management',
      description: 'Audits, findings & CAPAs',
      icon: <AuditIcon />,
      path: '/audit',
      requiresRole: ['HSSE MANAGER', 'ADMIN'],
      gradient: [theme.palette.secondary.main, theme.palette.secondary.dark],
      hasChart: true,
      statValue: openCapasCount,
      statLabel: 'Open CAPAs',
    },
    {
      id: 'risk',
      title: 'Risk Management',
      description: 'Risk assessments',
      icon: <RiskIcon />,
      path: '/risks',
      gradient: [theme.palette.error.main, theme.palette.error.dark],
    },
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'System settings',
      icon: <AdminIcon />,
      path: '/admin',
      requiresRole: ['HSSE MANAGER', 'ADMIN'],
      gradient: [theme.palette.grey[700], theme.palette.grey[900]],
    },
  ];

  const availableApps = apps.filter((app) => {
    if (!app.requiresRole) return true;
    if (!user) return false;
    return app.requiresRole.includes(user.position) || user.is_superuser;
  });

  const renderChart = (app: AppCard) => {
    if (!app.hasChart || loading) {
      return (
        <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '60%', height: 6, borderRadius: 3 }} />
        </Box>
      );
    }

    switch (app.id) {
      case 'document-hub':
        if (documentStatusData.length === 0 || documentStatusData.every(d => d.value === 0)) {
          return (
            <Box sx={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                No documents yet
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ height: 160, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={documentStatusData}>
                <defs>
                  <linearGradient id={`gradient-${app.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={app.gradient[0]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={app.gradient[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    boxShadow: theme.shadows[4],
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={app.gradient[0]}
                  strokeWidth={2}
                  fill={`url(#gradient-${app.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        );

      case 'ppe':
        if (lowStockData.length === 0) {
          return (
            <Box sx={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                All stock levels good
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ height: 160, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lowStockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={70} 
                  tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    boxShadow: theme.shadows[4],
                  }}
                />
                <Bar 
                  dataKey="stock" 
                  fill={app.gradient[0]} 
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );

      case 'audit':
        if (capaPriorityData.length === 0) {
          return (
            <Box sx={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                No CAPAs available
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ height: 160, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capaPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {capaPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    boxShadow: theme.shadows[4],
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        minHeight: '100vh', 
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome back, {user?.first_name || 'User'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your HSSE operations from one central dashboard
          </Typography>
        </Box>

        {/* App Grid */}
        <Grid container spacing={3}>
          {availableApps.map((app) => (
            <Grid item xs={12} sm={6} md={3} key={app.id}>
              <Card
                onClick={() => navigate(app.path)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${alpha(app.gradient[0], 0.05)} 0%, ${alpha(app.gradient[1], 0.02)} 100%)`,
                  border: `1px solid ${alpha(app.gradient[0], 0.2)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${app.gradient[0]}, ${app.gradient[1]})`,
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 12px 24px ${alpha(app.gradient[0], 0.2)}`,
                    borderColor: app.gradient[0],
                    '&::before': {
                      opacity: 1,
                    },
                    '& .card-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .card-arrow': {
                      opacity: 1,
                      transform: 'translateX(4px)',
                    },
                },
                }}
              >
                <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: app.hasChart ? 1.5 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                      <Box
                        className="card-icon"
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${app.gradient[0]}, ${app.gradient[1]})`,
                          color: theme.palette.common.white,
                          boxShadow: `0 4px 12px ${alpha(app.gradient[0], 0.3)}`,
                          transition: 'transform 0.3s',
                          flexShrink: 0,
                          '& svg': {
                            fontSize: 28,
                          },
                        }}
                      >
                        {app.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.25 }}>
                          {app.title}
                        </Typography>
                        {app.statValue !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: app.gradient[0] }}>
                              {app.statValue}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {app.statLabel}
                            </Typography>
                          </Box>
                        )}
                        {!app.hasChart && !app.statValue && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mt: 0.25 }}>
                            {app.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      className="card-arrow"
                      size="small"
                      sx={{
                        opacity: 0,
                        transition: 'all 0.3s',
                        color: app.gradient[0],
                        '&:hover': {
                          bgcolor: alpha(app.gradient[0], 0.1),
                        },
                      }}
                    >
                      <ArrowIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Chart */}
                  {app.hasChart && renderChart(app)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats Row */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total Documents
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.primary.main }}>
                      {totalDocuments}
                    </Typography>
                  </Box>
                  <DocumentIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.2) }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Open CAPAs
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.warning.main }}>
                      {openCapasCount}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, color: alpha(theme.palette.warning.main, 0.2) }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Low PPE Stock
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.error.main }}>
                      {lowStockCount}
                    </Typography>
                  </Box>
                  <PPEIcon sx={{ fontSize: 40, color: alpha(theme.palette.error.main, 0.2) }} />
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
