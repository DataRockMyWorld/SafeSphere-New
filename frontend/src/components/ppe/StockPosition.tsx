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
  Alert,
  LinearProgress,
  Tooltip,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Badge,
  Snackbar,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';

interface StockPosition {
  ppe_category: {
    id: number;
    name: string;
    description: string;
    low_stock_threshold: number;
    lifespan_months: number;
  };
  total_received: number;
  total_issued: number;
  total_damaged: number;
  total_expired: number;
  current_stock: number;
  is_low_stock: boolean;
}

interface LowStockAlert {
  ppe_category: {
    id: number;
    name: string;
    description: string;
    low_stock_threshold: number;
  };
  current_stock: number;
  threshold: number;
}

interface ExpiryAlert {
  ppe_issue: {
    id: number;
    employee: {
      first_name: string;
      last_name: string;
    };
    ppe_category: {
      name: string;
    };
    expiry_date: string;
  };
  days_until_expiry: number;
  is_expired: boolean;
}

interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone_number: string;
}

interface PurchaseData {
  quantity: number;
  vendor: number;
  cost_per_unit: number;
  notes: string;
  receipt_document?: File;
}

const StockPosition: React.FC = () => {
  const theme = useTheme();
  const [stockPositions, setStockPositions] = useState<StockPosition[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockLevelFilter, setStockLevelFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  // Dialog states
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StockPosition | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    quantity: 0,
    vendor: 0,
    cost_per_unit: 0,
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stockResponse, lowStockResponse, expiryResponse, vendorsResponse] = await Promise.all([
        axiosInstance.get('/ppes/dashboard/stock-position/'),
        axiosInstance.get('/ppes/dashboard/low-stock-alerts/'),
        axiosInstance.get('/ppes/dashboard/expiry-alerts/'),
        axiosInstance.get('/ppes/vendors/'),
      ]);

      setStockPositions(stockResponse.data);
      setLowStockAlerts(lowStockResponse.data);
      setExpiryAlerts(expiryResponse.data);
      setVendors(vendorsResponse.data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPurchaseDialog = (category: StockPosition) => {
    setSelectedCategory(category);
    const suggestedQuantity = Math.max(category.ppe_category.low_stock_threshold - category.current_stock, 10);
    setPurchaseData({
      quantity: suggestedQuantity,
      vendor: 0, // Reset vendor to 0 for new dialog
      cost_per_unit: 0,
      notes: `Stock replenishment for ${category.ppe_category.name}`,
    });
    setOpenPurchaseDialog(true);
  };

  const handleClosePurchaseDialog = () => {
    setOpenPurchaseDialog(false);
    setSelectedCategory(null);
    resetPurchaseForm();
  };

  const resetPurchaseForm = () => {
    setPurchaseData({
      quantity: 0,
      vendor: 0,
      cost_per_unit: 0,
      notes: '',
    });
    setSelectedFile(null);
  };

  const handlePurchaseSubmit = async () => {
    if (!selectedCategory) return;

    try {
      const total_cost = purchaseData.quantity * purchaseData.cost_per_unit;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('ppe_category', selectedCategory.ppe_category.id.toString());
      formData.append('vendor', purchaseData.vendor.toString());
      formData.append('quantity', purchaseData.quantity.toString());
      formData.append('cost_per_unit', purchaseData.cost_per_unit.toString());
      formData.append('total_cost', total_cost.toString());
      formData.append('purchase_date', new Date().toISOString().split('T')[0]);
      formData.append('notes', purchaseData.notes);
      
      // Add file if selected
      if (selectedFile) {
        formData.append('receipt_document', selectedFile);
      }

      await axiosInstance.post('/ppes/purchases/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showNotification('Purchase order created successfully', 'success');
      handleClosePurchaseDialog();
      fetchData();
    } catch (err) {
      console.error('Error creating purchase:', err);
      showNotification('Failed to create purchase order', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStockLevelColor = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100;
    if (percentage <= 25) return theme.palette.error.main;
    if (percentage <= 50) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStockLevelChip = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100;
    if (percentage <= 25) return { label: 'Critical', color: 'error' as any };
    if (percentage <= 50) return { label: 'Low', color: 'warning' as any };
    if (percentage <= 75) return { label: 'Moderate', color: 'info' as any };
    return { label: 'Good', color: 'success' as any };
  };

  const filteredStockPositions = stockPositions.filter(item => {
    const matchesSearch = 
      item.ppe_category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ppe_category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || item.ppe_category.id.toString() === categoryFilter;
    
    const matchesStockLevel = (() => {
      if (stockLevelFilter === 'ALL') return true;
      const { color } = getStockLevelChip(item.current_stock, item.ppe_category.low_stock_threshold);
      return color === stockLevelFilter;
    })();
    
    const matchesLowStockFilter = !showLowStockOnly || item.is_low_stock;
    
    return matchesSearch && matchesCategory && matchesStockLevel && matchesLowStockFilter;
  });

  const filteredExpiryAlerts = expiryAlerts.filter(alert => {
    const matchesSearch = 
      alert.ppe_issue.employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.ppe_issue.employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.ppe_issue.ppe_category.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpiredFilter = !showExpiredOnly || alert.is_expired;
    
    return matchesSearch && matchesExpiredFilter;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getTabData = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: return filteredStockPositions; // Stock Position
      case 1: return lowStockAlerts; // Low Stock Alerts
      case 2: return filteredExpiryAlerts; // Expiry Alerts
      default: return filteredStockPositions;
    }
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
            Stock Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Monitor stock positions, low stock alerts, and expiry warnings
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stockPositions.length}
                    </Typography>
                    <Typography variant="body2">Total Categories</Typography>
                  </Box>
                  <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {lowStockAlerts.length}
                    </Typography>
                    <Typography variant="body2">Low Stock Alerts</Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {expiryAlerts.filter(a => a.is_expired).length}
                    </Typography>
                    <Typography variant="body2">Expired Items</Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {expiryAlerts.filter(a => !a.is_expired && a.days_until_expiry <= 30).length}
                    </Typography>
                    <Typography variant="body2">Expiring Soon</Typography>
                  </Box>
                  <TimelineIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {stockPositions.map((item) => (
                      <MenuItem key={item.ppe_category.id} value={item.ppe_category.id}>
                        {item.ppe_category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Stock Level</InputLabel>
                  <Select
                    value={stockLevelFilter}
                    onChange={(e) => setStockLevelFilter(e.target.value)}
                    label="Stock Level"
                  >
                    <MenuItem value="ALL">All Levels</MenuItem>
                    <MenuItem value="error">Critical</MenuItem>
                    <MenuItem value="warning">Low</MenuItem>
                    <MenuItem value="info">Moderate</MenuItem>
                    <MenuItem value="success">Good</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showLowStockOnly}
                        onChange={(e) => setShowLowStockOnly(e.target.checked)}
                      />
                    }
                    label="Low Stock Only"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showExpiredOnly}
                        onChange={(e) => setShowExpiredOnly(e.target.checked)}
                      />
                    }
                    label="Expired Only"
                  />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchData}
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
                    Stock Position
                    <Badge badgeContent={filteredStockPositions.length} color="primary" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Low Stock Alerts
                    <Badge badgeContent={lowStockAlerts.length} color="warning" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Expiry Alerts
                    <Badge badgeContent={expiryAlerts.length} color="error" />
                  </Box>
                } 
              />
            </Tabs>

            {/* Content based on active tab */}
            {activeTab === 0 && (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Current Stock</TableCell>
                      <TableCell>Threshold</TableCell>
                      <TableCell>Stock Level</TableCell>
                      <TableCell>Total Received</TableCell>
                      <TableCell>Total Issued</TableCell>
                      <TableCell>Damaged/Expired</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStockPositions.map((item) => (
                      <TableRow key={item.ppe_category.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.ppe_category.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.ppe_category.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.current_stock}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.ppe_category.low_stock_threshold}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStockLevelChip(item.current_stock, item.ppe_category.low_stock_threshold).label}
                            color={getStockLevelChip(item.current_stock, item.ppe_category.low_stock_threshold).color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main">
                            {item.total_received}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="info.main">
                            {item.total_issued}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {item.total_damaged + item.total_expired}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Create Purchase Order">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPurchaseDialog(item)}
                                color="primary"
                              >
                                <ShoppingCartIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton size="small">
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
            )}

            {activeTab === 1 && (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Current Stock</TableCell>
                      <TableCell>Threshold</TableCell>
                      <TableCell>Stock Level</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockAlerts.map((alert) => (
                      <TableRow key={alert.ppe_category.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {alert.ppe_category.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {alert.ppe_category.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                            {alert.current_stock}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {alert.threshold}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.grey[300], 0.5),
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${(alert.current_stock / alert.threshold) * 100}%`,
                                  height: '100%',
                                  bgcolor: getStockLevelColor(alert.current_stock, alert.threshold),
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round((alert.current_stock / alert.threshold) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ShoppingCartIcon />}
                            onClick={() => handleOpenPurchaseDialog({
                              ppe_category: alert.ppe_category,
                              current_stock: alert.current_stock,
                              total_received: 0,
                              total_issued: 0,
                              total_damaged: 0,
                              total_expired: 0,
                              is_low_stock: true
                            })}
                          >
                            Order Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 2 && (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>PPE Category</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Days Until Expiry</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExpiryAlerts.map((alert) => (
                      <TableRow key={alert.ppe_issue.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {alert.ppe_issue.employee.first_name} {alert.ppe_issue.employee.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={alert.ppe_issue.ppe_category.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(alert.ppe_issue.expiry_date), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={alert.is_expired ? 'error.main' : alert.days_until_expiry <= 7 ? 'warning.main' : 'text.primary'}
                          >
                            {alert.is_expired ? 'Expired' : `${alert.days_until_expiry} days`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={alert.is_expired ? 'Expired' : alert.days_until_expiry <= 7 ? 'Expiring Soon' : 'Active'}
                            color={alert.is_expired ? 'error' : alert.days_until_expiry <= 7 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Replace PPE">
                              <IconButton size="small" color="primary">
                                <AddIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Purchase Dialog */}
        <Dialog open={openPurchaseDialog} onClose={handleClosePurchaseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogContent>
            {selectedCategory && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Creating purchase order for <strong>{selectedCategory.ppe_category.name}</strong>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={purchaseData.quantity}
                    onChange={(e) => setPurchaseData({ ...purchaseData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vendor</InputLabel>
                    <Select
                      value={purchaseData.vendor}
                      onChange={(e) => setPurchaseData({ ...purchaseData, vendor: parseInt(e.target.value) || 0 })}
                      label="Vendor"
                    >
                      <MenuItem value={0}>Select a Vendor</MenuItem>
                      {vendors.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cost per Unit"
                    type="number"
                    value={purchaseData.cost_per_unit}
                    onChange={(e) => setPurchaseData({ ...purchaseData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={purchaseData.notes}
                    onChange={(e) => setPurchaseData({ ...purchaseData, notes: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <input
                    accept="image/*,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="receipt-file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="receipt-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                    >
                      {selectedFile ? selectedFile.name : 'Upload Receipt Document'}
                    </Button>
                  </label>
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info">
                    Total Cost: ${(purchaseData.quantity * purchaseData.cost_per_unit).toFixed(2)}
                  </Alert>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePurchaseDialog}>Cancel</Button>
            <Button 
              onClick={handlePurchaseSubmit}
              variant="contained"
              disabled={!purchaseData.quantity || !purchaseData.cost_per_unit || !purchaseData.vendor}
            >
              Create Purchase Order
            </Button>
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

export default StockPosition; 