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
} from '@mui/icons-material';
import axios from 'axios';

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
    changeRequests: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    draftDocuments: 0,
    documentTypes: { 
      policy: 0, 
      systemDocument: 0, 
      procedure: 0, 
      form: 0, 
      ssow: 0, 
      other: 0 
    },
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
          changeRequests: 5,
          approvedDocuments: 142,
          rejectedDocuments: 6,
          draftDocuments: 12,
          documentTypes: { 
            policy: 45, 
            systemDocument: 38, 
            procedure: 52, 
            form: 15, 
            ssow: 8, 
            other: 21 
          },
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
          {
            id: 4,
            type: 'change',
            title: 'PPE Usage Guidelines',
            user: 'Lisa Brown',
            timestamp: '8 hours ago',
            status: 'pending',
          },
          {
            id: 5,
            type: 'document',
            title: 'Incident Reporting Procedure',
            user: 'David Lee',
            timestamp: '1 day ago',
            status: 'approved',
          },
          {
            id: 6,
            type: 'request',
            title: 'Training Material Update',
            user: 'Emma Davis',
            timestamp: '1 day ago',
            status: 'pending',
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

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return <DocumentIcon />;
      case 'systemDocument':
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Document Management Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor document status, approvals, and recent activities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Top Row - Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Documents"
            value={metrics.totalDocuments}
            icon={<DocumentIcon />}
            trend="+12% this month"
            color={theme.palette.primary.main}
            subtitle="All document types"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Approvals"
            value={metrics.pendingApprovals}
            icon={<ApprovalIcon />}
            color={theme.palette.warning.main}
            subtitle="Requires attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Change Requests"
            value={metrics.changeRequests}
            icon={<ChangeRequestIcon />}
            color={theme.palette.info.main}
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Approved Documents"
            value={metrics.approvedDocuments}
            icon={<ApprovedIcon />}
            trend="+8% this week"
            color={theme.palette.success.main}
            subtitle="Successfully approved"
          />
        </Grid>

        {/* Document Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Document Status Distribution
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography variant="body2" color="text.primary" fontWeight="medium">
                    {Math.round((metrics.approvedDocuments / metrics.totalDocuments) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.approvedDocuments / metrics.totalDocuments) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.success.main,
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approval
                  </Typography>
                  <Typography variant="body2" color="text.primary" fontWeight="medium">
                    {Math.round((metrics.pendingApprovals / metrics.totalDocuments) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.pendingApprovals / metrics.totalDocuments) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.warning.main,
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Draft Documents
                  </Typography>
                  <Typography variant="body2" color="text.primary" fontWeight="medium">
                    {Math.round((metrics.draftDocuments / metrics.totalDocuments) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.draftDocuments / metrics.totalDocuments) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.info.main,
                    },
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography variant="body2" color="text.primary" fontWeight="medium">
                    {Math.round((metrics.rejectedDocuments / metrics.totalDocuments) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.rejectedDocuments / metrics.totalDocuments) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.error.main,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Document Types Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Document Types
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                      <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2">Policies</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.documentTypes.policy / metrics.totalDocuments) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {metrics.documentTypes.policy}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                      <TemplateIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      <Typography variant="body2">System Docs</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.documentTypes.systemDocument / metrics.totalDocuments) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.secondary.main,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {metrics.documentTypes.systemDocument}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                      <AssignmentIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                      <Typography variant="body2">Procedures</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.documentTypes.procedure / metrics.totalDocuments) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.success.main,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {metrics.documentTypes.procedure}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                      <RecordsIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                      <Typography variant="body2">Forms</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.documentTypes.form / metrics.totalDocuments) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.warning.main,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {metrics.documentTypes.form}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                      <WarningIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                      <Typography variant="body2">SSOW</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.documentTypes.ssow / metrics.totalDocuments) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.error.main,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {metrics.documentTypes.ssow}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1), 
                              mr: 2,
                              width: 32,
                              height: 32
                            }}>
                              {getStatusIcon(activity.status)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {activity.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {activity.user}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={activity.type}
                            variant="outlined"
                            sx={{
                              textTransform: 'capitalize',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {activity.timestamp}
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
  );
};

export default DocumentManagementDashboard; 