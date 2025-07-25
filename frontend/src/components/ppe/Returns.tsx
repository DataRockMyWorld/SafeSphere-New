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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Tooltip,
  Stack,
  Badge,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AssignmentReturn as ReturnIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';

interface Return {
  id: number;
  employee: number;
  employee_name: string;
  ppe_issue: number;
  ppe_category_name: string;
  return_date: string;
  return_reason: string;
  condition: 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  received_by?: number;
  received_by_name?: string;
  notes?: string;
  created_at: string;
}

interface PPEIssue {
  id: number;
  employee: number;
  employee_name: string;
  ppe_category: number;
  ppe_category_name: string;
  quantity: number;
  issue_date: string;
  expiry_date: string;
  status: string;
  is_expired: boolean;
  days_until_expiry: number;
}

interface ReturnStats {
  total_returns: number;
  good_condition: number;
  fair_condition: number;
  poor_condition: number;
  damaged_condition: number;
}

const Returns: React.FC = () => {
  const theme = useTheme();
  const [returns, setReturns] = useState<Return[]>([]);
  const [ppeIssues, setPpeIssues] = useState<PPEIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReturnStats>({
    total_returns: 0,
    good_condition: 0,
    fair_condition: 0,
    poor_condition: 0,
    damaged_condition: 0
  });

  // Dialog states
  const [returnDialog, setReturnDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  // Form states
  const [returnForm, setReturnForm] = useState({
    ppe_issue: '',
    return_date: new Date(),
    return_reason: '',
    condition: 'GOOD' as 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED',
    notes: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState(0);

  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Load data
  useEffect(() => {
    loadReturns();
    loadPpeIssues();
  }, []);

  const loadReturns = async () => {
    try {
      const response = await axiosInstance.get('/ppes/returns/');
      setReturns(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error loading returns:', error);
      showNotification('Error loading returns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPpeIssues = async () => {
    try {
      const response = await axiosInstance.get('/ppes/issues/');
      // Filter for active PPE issues that can be returned
      const activeIssues = response.data.filter((issue: PPEIssue) => 
        issue.status === 'ACTIVE' && !issue.is_expired
      );
      setPpeIssues(activeIssues);
    } catch (error) {
      console.error('Error loading PPE issues:', error);
    }
  };

  const calculateStats = (returnData: Return[]) => {
    const stats = {
      total_returns: returnData.length,
      good_condition: returnData.filter(r => r.condition === 'GOOD').length,
      fair_condition: returnData.filter(r => r.condition === 'FAIR').length,
      poor_condition: returnData.filter(r => r.condition === 'POOR').length,
      damaged_condition: returnData.filter(r => r.condition === 'DAMAGED').length
    };
    setStats(stats);
  };

  const handleCreateReturn = async () => {
    try {
      const response = await axiosInstance.post('/ppes/returns/', {
        ppe_issue: parseInt(returnForm.ppe_issue),
        return_date: format(returnForm.return_date, 'yyyy-MM-dd'),
        return_reason: returnForm.return_reason,
        condition: returnForm.condition,
        notes: returnForm.notes
      });

      showNotification('Return processed successfully', 'success');
      setReturnDialog(false);
      resetReturnForm();
      loadReturns();
    } catch (error) {
      console.error('Error creating return:', error);
      showNotification('Error processing return', 'error');
    }
  };

  const resetReturnForm = () => {
    setReturnForm({
      ppe_issue: '',
      return_date: new Date(),
      return_reason: '',
      condition: 'GOOD',
      notes: ''
    });
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'GOOD': return 'success';
      case 'FAIR': return 'info';
      case 'POOR': return 'warning';
      case 'DAMAGED': return 'error';
      default: return 'default';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'GOOD': return <CheckIcon />;
      case 'FAIR': return <ReturnIcon />;
      case 'POOR': return <WarningIcon />;
      case 'DAMAGED': return <CancelIcon />;
      default: return null;
    }
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = 
      returnItem.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.ppe_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.return_reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCondition = conditionFilter === 'ALL' || returnItem.condition === conditionFilter;
    
    return matchesSearch && matchesCondition;
  });

  const getTabReturns = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: return filteredReturns; // All
      case 1: return filteredReturns.filter(r => r.condition === 'GOOD');
      case 2: return filteredReturns.filter(r => r.condition === 'FAIR');
      case 3: return filteredReturns.filter(r => r.condition === 'POOR');
      case 4: return filteredReturns.filter(r => r.condition === 'DAMAGED');
      default: return filteredReturns;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            PPE Returns
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Process PPE returns and track disposal
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.total_returns}
                    </Typography>
                    <Typography variant="body2">Total Returns</Typography>
                  </Box>
                  <ReturnIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.good_condition}
                    </Typography>
                    <Typography variant="body2">Good Condition</Typography>
                  </Box>
                  <CheckIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.fair_condition}
                    </Typography>
                    <Typography variant="body2">Fair Condition</Typography>
                  </Box>
                  <ReturnIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.poor_condition}
                    </Typography>
                    <Typography variant="body2">Poor Condition</Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.damaged_condition}
                    </Typography>
                    <Typography variant="body2">Damaged</Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    label="Condition"
                  >
                    <MenuItem value="ALL">All Conditions</MenuItem>
                    <MenuItem value="GOOD">Good</MenuItem>
                    <MenuItem value="FAIR">Fair</MenuItem>
                    <MenuItem value="POOR">Poor</MenuItem>
                    <MenuItem value="DAMAGED">Damaged</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setReturnDialog(true)}
                    sx={{ flex: 1 }}
                  >
                    Process Return
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadReturns}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 3
              }}
            >
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    All
                    <Badge badgeContent={filteredReturns.length} color="primary" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Good
                    <Badge badgeContent={filteredReturns.filter(r => r.condition === 'GOOD').length} color="success" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Fair
                    <Badge badgeContent={filteredReturns.filter(r => r.condition === 'FAIR').length} color="info" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Poor
                    <Badge badgeContent={filteredReturns.filter(r => r.condition === 'POOR').length} color="warning" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Damaged
                    <Badge badgeContent={filteredReturns.filter(r => r.condition === 'DAMAGED').length} color="error" />
                  </Box>
                } 
              />
            </Tabs>

            {/* Returns Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>PPE Category</TableCell>
                    <TableCell>Return Date</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Received By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabReturns(activeTab).map((returnItem) => (
                    <TableRow key={returnItem.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <PersonIcon />
                          </Avatar>
                          <Typography variant="body2">
                            {returnItem.employee_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={returnItem.ppe_category_name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(returnItem.return_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {returnItem.return_reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getConditionIcon(returnItem.condition)}
                          label={returnItem.condition}
                          color={getConditionColor(returnItem.condition) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {returnItem.received_by_name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setViewDialog(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Process Return Dialog */}
        <Dialog open={returnDialog} onClose={() => setReturnDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Process PPE Return</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>PPE Issue</InputLabel>
                  <Select
                    value={returnForm.ppe_issue}
                    onChange={(e) => setReturnForm({ ...returnForm, ppe_issue: e.target.value })}
                    label="PPE Issue"
                  >
                    {ppeIssues.map((issue) => (
                      <MenuItem key={issue.id} value={issue.id}>
                        {issue.ppe_category_name} - {issue.employee_name} (Expires: {format(new Date(issue.expiry_date), 'MMM dd, yyyy')})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Return Date"
                  value={returnForm.return_date}
                  onChange={(newValue) => setReturnForm({ ...returnForm, return_date: newValue || new Date() })}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={returnForm.condition}
                    onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value as 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' })}
                    label="Condition"
                  >
                    <MenuItem value="GOOD">Good</MenuItem>
                    <MenuItem value="FAIR">Fair</MenuItem>
                    <MenuItem value="POOR">Poor</MenuItem>
                    <MenuItem value="DAMAGED">Damaged</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Return Reason"
                  value={returnForm.return_reason}
                  onChange={(e) => setReturnForm({ ...returnForm, return_reason: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReturnDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateReturn}
              variant="contained"
              disabled={!returnForm.ppe_issue || !returnForm.return_reason}
            >
              Process Return
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Return Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Return Details</DialogTitle>
          <DialogContent>
            {selectedReturn && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Employee</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReturn.employee_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">PPE Category</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReturn.ppe_category_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Return Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {format(new Date(selectedReturn.return_date), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Condition</Typography>
                  <Chip
                    icon={getConditionIcon(selectedReturn.condition)}
                    label={selectedReturn.condition}
                    color={getConditionColor(selectedReturn.condition) as any}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Return Reason</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReturn.return_reason}
                  </Typography>
                </Grid>
                
                {selectedReturn.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedReturn.notes}
                    </Typography>
                  </Grid>
                )}
                
                {selectedReturn.received_by_name && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Received By</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedReturn.received_by_name}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {format(new Date(selectedReturn.created_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Returns; 