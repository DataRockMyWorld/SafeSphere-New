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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, addMonths } from 'date-fns';
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
      id={`issuance-tabpanel-${index}`}
      aria-labelledby={`issuance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface PPEIssue {
  id: number;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
  ppe_category: {
    id: number;
    name: string;
    description: string;
    lifespan_months: number;
  };
  quantity: number;
  issue_date: string;
  expiry_date: string;
  issued_by: {
    id: number;
    first_name: string;
    last_name: string;
  };
  status: 'ACTIVE' | 'EXPIRED' | 'DAMAGED' | 'RETURNED' | 'TRANSFERRED';
  notes: string;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
  days_until_expiry: number;
  employee_name?: string; // Added for the new_code
}

interface PPECategory {
  id: number;
  name: string;
  description: string;
  lifespan_months: number;
  low_stock_threshold: number;
  is_active: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
}

interface PPEInventory {
  id: number;
  ppe_category: PPECategory;
  current_stock: number;
  total_received: number;
  total_issued: number;
}

const Issuance: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [issues, setIssues] = useState<PPEIssue[]>([]);
  const [categories, setCategories] = useState<PPECategory[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [inventory, setInventory] = useState<PPEInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openIssueDialog, setOpenIssueDialog] = useState(false);
  const [openBulkIssueDialog, setOpenBulkIssueDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<PPEIssue | null>(null);
  
  // Form states
  const [issueData, setIssueData] = useState({
    employee: '',
    ppe_category: '',
    quantity: 1,
    issue_date: new Date(),
    notes: '',
  });
  
  const [bulkIssueData, setBulkIssueData] = useState({
    employees: [] as string[],
    ppe_category: '',
    quantity_per_employee: 1,
    issue_date: new Date(),
    notes: '',
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    employee: '',
    dateRange: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Helper function to check if user has HSSE Manager permissions
  const hasHSSEManagerPermissions = () => {
    return user?.position === 'HSSE MANAGER' || 
           user?.role === 'MANAGER' || 
           user?.is_staff || 
           user?.is_superuser;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Current user:', user);
      console.log('User position:', user?.position);

      // Determine which API endpoints to use based on user permissions
      const isHSSEManager = user?.position === 'HSSE MANAGER' || user?.is_superuser;
      
      const [issuesRes, categoriesRes, employeesRes, inventoryRes] = await Promise.all([
        // HSSE Managers see all issues, regular users see only their own
        axiosInstance.get(isHSSEManager ? '/ppes/issues/' : '/ppes/issues/my-issues/'),
        axiosInstance.get('/ppes/categories/'),
        // HSSE Managers see all users, regular users don't need employee list for issuance
        isHSSEManager ? axiosInstance.get('/users/') : Promise.resolve({ data: [] }),
        axiosInstance.get('/ppes/inventory/'),
      ]);

      console.log('API responses:', {
        issues: issuesRes.data,
        categories: categoriesRes.data,
        employees: employeesRes.data,
        inventory: inventoryRes.data
      });

      setIssues(issuesRes.data.results || issuesRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setEmployees(employeesRes.data.results || employeesRes.data);
      setInventory(inventoryRes.data.results || inventoryRes.data);
    } catch (err) {
      console.error('Error fetching issuance data:', err);
      setError('Failed to load issuance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenIssueDialog = () => {
    setIssueData({
      employee: '',
      ppe_category: '',
      quantity: 1,
      issue_date: new Date(),
      notes: '',
    });
    setOpenIssueDialog(true);
  };

  const handleCloseIssueDialog = () => {
    setOpenIssueDialog(false);
  };

  const handleOpenBulkIssueDialog = () => {
    setBulkIssueData({
      employees: [],
      ppe_category: '',
      quantity_per_employee: 1,
      issue_date: new Date(),
      notes: '',
    });
    setOpenBulkIssueDialog(true);
  };

  const handleCloseBulkIssueDialog = () => {
    setOpenBulkIssueDialog(false);
  };

  const handleIssueSubmit = async () => {
    try {
      if (!issueData.employee || !issueData.ppe_category) {
        setError('Please fill in all required fields');
        return;
      }

      const selectedCategory = categories.find(c => c.id === parseInt(issueData.ppe_category));
      const expiryDate = addMonths(issueData.issue_date, selectedCategory?.lifespan_months || 12);

      await axiosInstance.post('/ppes/issues/', {
        employee: issueData.employee,
        ppe_category: issueData.ppe_category,
        quantity: issueData.quantity,
        issue_date: format(issueData.issue_date, 'yyyy-MM-dd'),
        expiry_date: format(expiryDate, 'yyyy-MM-dd'),
        notes: issueData.notes,
      });

      handleCloseIssueDialog();
      fetchData();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue PPE');
    }
  };

  const handleBulkIssueSubmit = async () => {
    try {
      if (!bulkIssueData.employees.length || !bulkIssueData.ppe_category) {
        setError('Please fill in all required fields');
        return;
      }

      await axiosInstance.post('/ppes/bulk/issue/', {
        employee_ids: bulkIssueData.employees,
        ppe_category_id: bulkIssueData.ppe_category,
        quantity_per_employee: bulkIssueData.quantity_per_employee,
        issue_date: format(bulkIssueData.issue_date, 'yyyy-MM-dd'),
        notes: bulkIssueData.notes,
      });

      handleCloseBulkIssueDialog();
      fetchData();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to bulk issue PPE');
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (window.confirm('Are you sure you want to delete this PPE issue?')) {
      try {
        await axiosInstance.delete(`/ppes/issues/${issueId}/`);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete PPE issue');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'EXPIRED': return 'error';
      case 'DAMAGED': return 'warning';
      case 'RETURNED': return 'info';
      case 'TRANSFERRED': return 'secondary';
      default: return 'default';
    }
  };

  const getExpiryStatus = (issue: PPEIssue) => {
    if (issue.is_expired) return { color: 'error', text: 'Expired' };
    if (issue.days_until_expiry <= 7) return { color: 'warning', text: 'Expiring Soon' };
    return { color: 'success', text: 'Active' };
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !filters.search || 
      issue.employee.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      issue.employee.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      issue.ppe_category.name.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || issue.status === filters.status;
    const matchesCategory = !filters.category || issue.ppe_category.id === parseInt(filters.category);
    const matchesEmployee = !filters.employee || issue.employee.id === parseInt(filters.employee);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesEmployee;
  });

  const getAvailableStock = (categoryId: number) => {
    const inventoryItem = inventory.find(inv => inv.ppe_category.id === categoryId);
    return inventoryItem?.current_stock || 0;
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
            PPE Issuance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hasHSSEManagerPermissions() 
              ? 'Issue PPE to employees and track assignments' 
              : 'View your PPE assignments and track expiry dates'
            }
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {hasHSSEManagerPermissions() && (
            <>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={handleOpenBulkIssueDialog}
              >
                Bulk Issue
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenIssueDialog}
              >
                Issue PPE
              </Button>
            </>
          )}
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
            placeholder="Search by employee name or PPE category..."
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
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                    <MenuItem value="DAMAGED">Damaged</MenuItem>
                    <MenuItem value="RETURNED">Returned</MenuItem>
                    <MenuItem value="TRANSFERRED">Transferred</MenuItem>
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
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {hasHSSEManagerPermissions() && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={filters.employee}
                      onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                      label="Employee"
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({
                    search: '',
                    status: '',
                    category: '',
                    employee: '',
                    dateRange: '',
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
            <Tab label="All Issues" />
            <Tab label="Active Issues" />
            <Tab label="Expiring Soon" />
            <Tab label="Expired" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    {hasHSSEManagerPermissions() && (
                      <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    {hasHSSEManagerPermissions() && (
                      <TableCell sx={{ fontWeight: 600 }}>Issued By</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIssues.map((issue) => {
                    const expiryStatus = getExpiryStatus(issue);
                    return (
                      <TableRow key={issue.id} hover>
                        {hasHSSEManagerPermissions() && (
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
                                  {issue.employee_name || `${issue.employee.first_name} ${issue.employee.last_name}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {issue.employee.department}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            <Typography variant="body2">{issue.ppe_category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={issue.quantity} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {format(parseISO(issue.issue_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {format(parseISO(issue.expiry_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={issue.status}
                              size="small"
                              color={getStatusColor(issue.status) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={expiryStatus.text}
                              size="small"
                              color={expiryStatus.color as any}
                            />
                          </Box>
                        </TableCell>
                        {hasHSSEManagerPermissions() && (
                          <TableCell>
                            <Typography variant="body2">
                              {issue.issued_by.first_name} {issue.issued_by.last_name}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {hasHSSEManagerPermissions() && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary">
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteIssue(issue.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days Remaining</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIssues
                    .filter(issue => issue.status === 'ACTIVE' && !issue.is_expired)
                    .map((issue) => (
                      <TableRow key={issue.id} hover>
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
                                {issue.employee_name || `${issue.employee.first_name} ${issue.employee.last_name}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {issue.employee.department}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            <Typography variant="body2">{issue.ppe_category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={issue.quantity} size="small" color="success" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(issue.issue_date), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(issue.expiry_date), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${issue.days_until_expiry} days`}
                            size="small"
                            color={issue.days_until_expiry <= 30 ? 'warning' : 'success'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {hasHSSEManagerPermissions() && (
                              <Tooltip title="Edit">
                                <IconButton size="small" color="primary">
                                  <EditIcon />
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
            <Grid container spacing={2}>
              {filteredIssues
                .filter(issue => issue.status === 'ACTIVE' && issue.days_until_expiry <= 30 && !issue.is_expired)
                .map((issue) => (
                  <Grid item xs={12} sm={6} md={4} key={issue.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WarningIcon color="warning" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {issue.ppe_category.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {issue.employee_name || `${issue.employee.first_name} ${issue.employee.last_name}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        Expires: {format(parseISO(issue.expiry_date), 'MMM dd, yyyy')}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, (issue.days_until_expiry / 30) * 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: theme.palette.warning.main,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {issue.days_until_expiry} days remaining
                      </Typography>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>PPE Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days Expired</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIssues
                    .filter(issue => issue.is_expired)
                    .map((issue) => (
                      <TableRow key={issue.id} hover>
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
                                {issue.employee_name || `${issue.employee.first_name} ${issue.employee.last_name}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {issue.employee.department}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            <Typography variant="body2">{issue.ppe_category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={issue.quantity} size="small" color="error" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(issue.issue_date), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(issue.expiry_date), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${Math.abs(issue.days_until_expiry)} days`}
                            size="small"
                            color="error"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {hasHSSEManagerPermissions() && (
                              <Tooltip title="Reissue">
                                <IconButton size="small" color="primary">
                                  <AddIcon />
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
        </CardContent>
      </Card>

      {/* Issue PPE Dialog */}
      <Dialog open={openIssueDialog} onClose={handleCloseIssueDialog} maxWidth="md" fullWidth>
        <DialogTitle>Issue PPE</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employee *</InputLabel>
                <Select
                  value={issueData.employee}
                  onChange={(e) => setIssueData({ ...issueData, employee: e.target.value })}
                  label="Employee *"
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>PPE Category *</InputLabel>
                <Select
                  value={issueData.ppe_category}
                  onChange={(e) => setIssueData({ ...issueData, ppe_category: e.target.value })}
                  label="PPE Category *"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name} (Stock: {getAvailableStock(category.id)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity *"
                type="number"
                value={issueData.quantity}
                onChange={(e) => setIssueData({ ...issueData, quantity: Number(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Issue Date *"
                  value={issueData.issue_date}
                  onChange={(date) => setIssueData({ ...issueData, issue_date: date || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={issueData.notes}
                onChange={(e) => setIssueData({ ...issueData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIssueDialog}>Cancel</Button>
          <Button onClick={handleIssueSubmit} variant="contained">
            Issue PPE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Issue Dialog */}
      <Dialog open={openBulkIssueDialog} onClose={handleCloseBulkIssueDialog} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Issue PPE</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Employees *</InputLabel>
                <Select
                  multiple
                  value={bulkIssueData.employees}
                  onChange={(e) => setBulkIssueData({ 
                    ...bulkIssueData, 
                    employees: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value 
                  })}
                  label="Employees *"
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>PPE Category *</InputLabel>
                <Select
                  value={bulkIssueData.ppe_category}
                  onChange={(e) => setBulkIssueData({ ...bulkIssueData, ppe_category: e.target.value })}
                  label="PPE Category *"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name} (Stock: {getAvailableStock(category.id)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity per Employee *"
                type="number"
                value={bulkIssueData.quantity_per_employee}
                onChange={(e) => setBulkIssueData({ ...bulkIssueData, quantity_per_employee: Number(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Issue Date *"
                  value={bulkIssueData.issue_date}
                  onChange={(date) => setBulkIssueData({ ...bulkIssueData, issue_date: date || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={bulkIssueData.notes}
                onChange={(e) => setBulkIssueData({ ...bulkIssueData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkIssueDialog}>Cancel</Button>
          <Button onClick={handleBulkIssueSubmit} variant="contained">
            Bulk Issue PPE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Issuance; 