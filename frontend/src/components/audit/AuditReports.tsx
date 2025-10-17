import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  useTheme,
  alpha,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Edit as EditIcon,
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface AuditReport {
  id: string;
  report_code: string;
  audit_plan: {
    audit_code: string;
    title: string;
  };
  overall_conformity_score: number;
  status: string;
  report_date: string;
  major_ncs_count: number;
  minor_ncs_count: number;
  observations_count: number;
  opportunities_count: number;
  total_findings: number;
  prepared_by: {
    first_name: string;
    last_name: string;
  };
}

const AuditReports: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Get available years from reports
  const availableYears = React.useMemo(() => {
    const years = new Set(reports.map(r => new Date(r.report_date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // Descending order
  }, [reports]);
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/audits/reports/');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showSnackbar('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return theme.palette.success.main;
      case 'SUBMITTED':
      case 'REVIEWED':
        return theme.palette.info.main;
      case 'DRAFT':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 75) return theme.palette.info.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Very Good';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };
  
  // Filter reports by year and date range
  const filteredReports = React.useMemo(() => {
    return reports.filter(report => {
      const reportDate = new Date(report.report_date);
      const reportYear = reportDate.getFullYear();
      
      // Year filter
      if (selectedYear !== 'ALL' && reportYear !== parseInt(selectedYear)) {
        return false;
      }
      
      // Date range filter
      if (startDate && reportDate < new Date(startDate)) {
        return false;
      }
      if (endDate && reportDate > new Date(endDate)) {
        return false;
      }
      
      return true;
    });
  }, [reports, selectedYear, startDate, endDate]);
  
  const handleClearFilters = () => {
    setSelectedYear('ALL');
    setStartDate('');
    setEndDate('');
  };
  
  if (loading) {
    return <LinearProgress />;
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Audit Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage audit reports and compliance scores
          </Typography>
        </Box>
      </Box>
      
      {/* Filters */}
      {reports.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <FilterIcon color="action" />
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filter by Year</InputLabel>
              <Select
                value={selectedYear}
                label="Filter by Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value="ALL">All Years</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }} />
              }}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }} />
              }}
              sx={{ minWidth: 200 }}
            />
            
            {(selectedYear !== 'ALL' || startDate || endDate) && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
            
            <Box sx={{ flex: 1 }} />
            
            <Typography variant="body2" color="text.secondary">
              Showing {filteredReports.length} of {reports.length} reports
            </Typography>
          </Stack>
        </Paper>
      )}
      
      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <Grid container spacing={3}>
          {filteredReports.map((report) => (
            <Grid item xs={12} key={report.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(getStatusColor(report.status), 0.2)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Left: Report Info */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          <ReportIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="overline"
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                              letterSpacing: 1,
                            }}
                          >
                            {report.report_code}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {report.audit_plan.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Audit: {report.audit_plan.audit_code}
                          </Typography>
                          <Chip
                            label={report.status}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(report.status), 0.1),
                              color: getStatusColor(report.status),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    
                    {/* Middle: Compliance Score */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Overall Conformity Score
                        </Typography>
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-flex',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h2"
                            sx={{
                              fontWeight: 700,
                              color: getScoreColor(report.overall_conformity_score),
                            }}
                          >
                            {report.overall_conformity_score}%
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: getScoreColor(report.overall_conformity_score),
                          }}
                        >
                          {getScoreGrade(report.overall_conformity_score)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={report.overall_conformity_score}
                          sx={{
                            mt: 2,
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(getScoreColor(report.overall_conformity_score), 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getScoreColor(report.overall_conformity_score),
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    {/* Right: Findings Breakdown */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                        Findings Summary
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ErrorIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
                            <Typography variant="body2">Major NCs</Typography>
                          </Box>
                          <Chip
                            label={report.major_ncs_count}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: theme.palette.error.main,
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                            <Typography variant="body2">Minor NCs</Typography>
                          </Box>
                          <Chip
                            label={report.minor_ncs_count}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main,
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                            <Typography variant="body2">Observations</Typography>
                          </Box>
                          <Chip
                            label={report.observations_count}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Total Findings
                          </Typography>
                          <Chip
                            label={report.total_findings}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                  
                  {/* Report Footer */}
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Prepared by: {report.prepared_by.first_name} {report.prepared_by.last_name} on {report.report_date}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Report">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      {user?.position === 'MD' && report.status === 'SUBMITTED' && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ApproveIcon />}
                          color="success"
                        >
                          Approve
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
          }}
        >
          <ReportIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No Audit Reports Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Audit reports will appear here once audits are completed
          </Typography>
        </Paper>
      )}
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditReports;

