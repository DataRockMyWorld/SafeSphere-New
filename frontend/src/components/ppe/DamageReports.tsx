import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Tooltip,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  Report as ReportIcon,
  Approval as ApprovalIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`damage-tabpanel-${index}`}
      aria-labelledby={`damage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface PPEDamageReport {
  id: number;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
  ppe_issue: {
    id: number;
    ppe_category: {
      id: number;
      name: string;
      description: string;
    };
    quantity: number;
    issue_date: string;
    expiry_date: string;
  };
  damage_description: string;
  damage_date: string;
  damage_image_url?: string;
  reported_at: string;
  reviewed_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  reviewed_at?: string;
  is_approved: boolean | null;
  replacement_issued: boolean;
  replacement_notes?: string;
}

interface PPEIssue {
  id: number;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    department: string;
  };
  ppe_category: {
    id: number;
    name: string;
    description: string;
  };
  quantity: number;
  issue_date: string;
  expiry_date: string;
  status: string;
  is_expired: boolean;
}

const DamageReports: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [damageReports, setDamageReports] = useState<PPEDamageReport[]>([]);
  const [ppeIssues, setPpeIssues] = useState<PPEIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PPEDamageReport | null>(null);
  
  // Form states
  const [reportData, setReportData] = useState({
    ppe_issue: '',
    damage_description: '',
    damage_date: new Date(),
    damage_image: null as File | null,
  });
  
  const [reviewData, setReviewData] = useState({
    is_approved: false,
    replacement_issued: false,
    replacement_notes: '',
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    employee: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportsRes, issuesRes] = await Promise.all([
        axiosInstance.get('/ppes/damage-reports/'),
        axiosInstance.get('/ppes/issues/'),
      ]);

      setDamageReports(reportsRes.data.results || reportsRes.data);
      setPpeIssues(issuesRes.data.results || issuesRes.data);
    } catch (err) {
      console.error('Error fetching damage reports data:', err);
      setError('Failed to load damage reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReportDialog = () => {
    setReportData({
      ppe_issue: '',
      damage_description: '',
      damage_date: new Date(),
      damage_image: null,
    });
    setOpenReportDialog(true);
  };

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
  };

  const handleOpenReviewDialog = (report: PPEDamageReport) => {
    setSelectedReport(report);
    setReviewData({
      is_approved: report.is_approved || false,
      replacement_issued: report.replacement_issued,
      replacement_notes: report.replacement_notes || '',
    });
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setSelectedReport(null);
  };

  const handleReportSubmit = async () => {
    try {
      if (!reportData.ppe_issue || !reportData.damage_description) {
        setError('Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      formData.append('ppe_issue', reportData.ppe_issue);
      formData.append('damage_description', reportData.damage_description);
      formData.append('damage_date', format(reportData.damage_date, 'yyyy-MM-dd'));
      
      if (reportData.damage_image) {
        formData.append('damage_image', reportData.damage_image);
      }

      await axiosInstance.post('/ppes/damage-reports/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleCloseReportDialog();
      fetchData();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit damage report');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      if (!selectedReport) return;

      await axiosInstance.post(`/ppes/damage-reports/${selectedReport.id}/review/`, {
        is_approved: reviewData.is_approved,
        replacement_issued: reviewData.replacement_issued,
        replacement_notes: reviewData.replacement_notes,
      });

      handleCloseReviewDialog();
      fetchData();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to review damage report');
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (window.confirm('Are you sure you want to delete this damage report?')) {
      try {
        await axiosInstance.delete(`/ppes/damage-reports/${reportId}/`);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete damage report');
      }
    }
  };

  const getStatusColor = (isApproved: boolean | null) => {
    if (isApproved === null) return 'warning';
    if (isApproved) return 'success';
    return 'error';
  };

  const getStatusText = (isApproved: boolean | null) => {
    if (isApproved === null) return 'Pending Review';
    if (isApproved) return 'Approved';
    return 'Rejected';
  };

  const filteredReports = damageReports.filter(report => {
    const matchesSearch = !filters.search || 
      report.employee.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.employee.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.ppe_issue.ppe_category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.damage_description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || 
      (filters.status === 'PENDING' && report.is_approved === null) ||
      (filters.status === 'APPROVED' && report.is_approved === true) ||
      (filters.status === 'REJECTED' && report.is_approved === false);
    
    const matchesCategory = !filters.category || 
      report.ppe_issue.ppe_category.id === parseInt(filters.category);
    
    const matchesEmployee = !filters.employee || 
      report.employee.id === parseInt(filters.employee);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesEmployee;
  });

  const getAvailablePPEIssues = () => {
    return ppeIssues.filter(issue => 
      issue.employee.id === user?.id && 
      issue.status === 'ACTIVE' && 
      !issue.is_expired
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            PPE Damage Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Report and track damaged PPE
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenReportDialog}
          >
            Report Damage
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters & Search
            </Typography>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              size="small"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </Box>
          
          <TextField
            fullWidth
            placeholder="Search by employee name, PPE category, or damage description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {showFilters && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending Review</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>PPE Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    label="PPE Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {Array.from(new Set(damageReports.map(r => r.ppe_issue.ppe_category.id))).map((categoryId) => {
                      const category = damageReports.find(r => r.ppe_issue.ppe_category.id === categoryId)?.ppe_issue.ppe_category;
                      return (
                        <MenuItem key={categoryId} value={categoryId}>
                          {category?.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={filters.employee}
                    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                    label="Employee"
                  >
                    <MenuItem value="">All Employees</MenuItem>
                    {Array.from(new Set(damageReports.map(r => r.employee.id))).map((employeeId) => {
                      const employee = damageReports.find(r => r.employee.id === employeeId)?.employee;
                      return (
                        <MenuItem key={employeeId} value={employeeId}>
                          {employee?.first_name} {employee?.last_name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({
                    search: '',
                    status: '',
                    category: '',
                    employee: '',
                  })}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Reports" />
            <Tab label="Pending Review" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Damage Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Damage Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Replacement</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 32,
                              height: 32,
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {report.employee.first_name} {report.employee.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.employee.department}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon color="action" fontSize="small" />
                          <Typography variant="body2">{report.ppe_issue.ppe_category.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {report.damage_description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {format(parseISO(report.damage_date), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(report.is_approved)}
                          size="small"
                          color={getStatusColor(report.is_approved) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.replacement_issued ? 'Issued' : 'Not Issued'}
                          size="small"
                          color={report.replacement_issued ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {user?.position === 'HSSE MANAGER' && report.is_approved === null && (
                            <Tooltip title="Review">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenReviewDialog(report)}
                              >
                                <ApprovalIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {report.employee.id === user?.id && (
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Damage Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reported Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports
                    .filter(report => report.is_approved === null)
                    .map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                color: theme.palette.warning.main,
                                width: 32,
                                height: 32,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {report.employee.first_name} {report.employee.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {report.employee.department}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            <Typography variant="body2">{report.ppe_issue.ppe_category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {report.damage_description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(report.reported_at), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {user?.position === 'HSSE MANAGER' && (
                              <Tooltip title="Review">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleOpenReviewDialog(report)}
                                >
                                  <ApprovalIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Damage Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reviewed By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Replacement Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports
                    .filter(report => report.is_approved === true)
                    .map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                width: 32,
                                height: 32,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {report.employee.first_name} {report.employee.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {report.employee.department}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            <Typography variant="body2">{report.ppe_issue.ppe_category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {report.damage_description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.reviewed_by ? `${report.reviewed_by.first_name} ${report.reviewed_by.last_name}` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.replacement_issued ? 'Issued' : 'Pending'}
                            size="small"
                            color={report.replacement_issued ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Damage Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reviewed By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rejection Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports
                    .filter(report => report.is_approved === false)
                    .map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                width: 32,
                                height: 32,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {report.employee.first_name} {report.employee.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {report.employee.department}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            <Typography variant="body2">{report.ppe_issue.ppe_category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {report.damage_description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.reviewed_by ? `${report.reviewed_by.first_name} ${report.reviewed_by.last_name}` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {report.replacement_notes || 'No reason provided'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Report Damage Dialog */}
      <Dialog open={openReportDialog} onClose={handleCloseReportDialog} maxWidth="md" fullWidth>
        <DialogTitle>Report PPE Damage</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>PPE Item *</InputLabel>
                <Select
                  value={reportData.ppe_issue}
                  onChange={(e) => setReportData({ ...reportData, ppe_issue: e.target.value })}
                  label="PPE Item *"
                >
                  {getAvailablePPEIssues().map((issue) => (
                    <MenuItem key={issue.id} value={issue.id}>
                      {issue.ppe_category.name} - Issued: {format(parseISO(issue.issue_date), 'MMM dd, yyyy')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Damage Description *"
                multiline
                rows={4}
                value={reportData.damage_description}
                onChange={(e) => setReportData({ ...reportData, damage_description: e.target.value })}
                placeholder="Describe the damage in detail..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Damage Date *"
                  value={reportData.damage_date}
                  onChange={(date) => setReportData({ ...reportData, damage_date: date || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                fullWidth
                sx={{ height: 56 }}
              >
                Upload Damage Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReportData({ ...reportData, damage_image: file });
                    }
                  }}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Cancel</Button>
          <Button onClick={handleReportSubmit} variant="contained">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Damage Report Dialog */}
      <Dialog open={openReviewDialog} onClose={handleCloseReviewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Review Damage Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Damage Report Details
                </Typography>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Employee:</strong> {selectedReport.employee.first_name} {selectedReport.employee.last_name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>PPE Category:</strong> {selectedReport.ppe_issue.ppe_category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Damage Description:</strong> {selectedReport.damage_description}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Damage Date:</strong> {format(parseISO(selectedReport.damage_date), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reviewData.is_approved}
                      onChange={(e) => setReviewData({ ...reviewData, is_approved: e.target.checked })}
                    />
                  }
                  label="Approve this damage report"
                />
              </Grid>

              {reviewData.is_approved && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reviewData.replacement_issued}
                        onChange={(e) => setReviewData({ ...reviewData, replacement_issued: e.target.checked })}
                      />
                    }
                    label="Issue replacement PPE"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Review Notes"
                  multiline
                  rows={3}
                  value={reviewData.replacement_notes}
                  onChange={(e) => setReviewData({ ...reviewData, replacement_notes: e.target.value })}
                  placeholder={reviewData.is_approved ? "Notes about replacement..." : "Reason for rejection..."}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DamageReports; 