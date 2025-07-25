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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Category as CategoryIcon,
  Business as VendorIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface PPECategory {
  id: number;
  name: string;
  description: string;
  lifespan_months: number;
  low_stock_threshold: number;
  is_active: boolean;
  default_image_url?: string;
}

interface PPEInventory {
  id: number;
  ppe_category: PPECategory;
  total_received: number;
  total_issued: number;
  total_damaged: number;
  total_expired: number;
  current_stock: number;
  last_updated: string;
  is_low_stock: boolean;
}

interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string;
}

interface StockMovement {
  id: number;
  movement_type: 'RECEIVED' | 'ISSUED' | 'DAMAGED' | 'EXPIRED' | 'ADJUSTED';
  quantity: number;
  date: string;
  reference: string;
  notes: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

const InventoryManagement: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [inventory, setInventory] = useState<PPEInventory[]>([]);
  const [categories, setCategories] = useState<PPECategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openAddStockDialog, setOpenAddStockDialog] = useState(false);
  const [openAdjustStockDialog, setOpenAdjustStockDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<PPEInventory | null>(null);
  
  // Form states
  const [addStockData, setAddStockData] = useState({
    ppe_category: '',
    quantity: 0,
    vendor: '',
    cost_per_unit: 0,
    batch_number: '',
    notes: '',
  });
  
  const [adjustStockData, setAdjustStockData] = useState({
    adjustment_type: 'ADD',
    quantity: 0,
    reason: '',
    notes: '',
  });

  const [settingsData, setSettingsData] = useState({
    auto_low_stock_alerts: true,
    low_stock_threshold_percentage: 20,
    expiry_alert_days: 30,
    require_approval_for_adjustments: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryResponse, categoriesResponse, vendorsResponse] = await Promise.all([
        axiosInstance.get('/ppes/inventory/'),
        axiosInstance.get('/ppes/categories/'),
        axiosInstance.get('/ppes/vendors/'),
      ]);

      setInventory(inventoryResponse.data);
      setCategories(categoriesResponse.data);
      setVendors(vendorsResponse.data);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddStockDialog = () => {
    setAddStockData({
      ppe_category: '',
      quantity: 0,
      vendor: '',
      cost_per_unit: 0,
      batch_number: `BATCH-${Date.now()}`,
      notes: '',
    });
    setOpenAddStockDialog(true);
  };

  const handleCloseAddStockDialog = () => {
    setOpenAddStockDialog(false);
  };

  const handleAddStockSubmit = async () => {
    try {
      const total_cost = addStockData.quantity * addStockData.cost_per_unit;
      
      await axiosInstance.post('/ppes/purchases/', {
        ppe_category: addStockData.ppe_category,
        vendor: addStockData.vendor,
        quantity: addStockData.quantity,
        cost_per_unit: addStockData.cost_per_unit,
        total_cost: total_cost,
        purchase_date: new Date().toISOString().split('T')[0],
        batch_number: addStockData.batch_number,
        notes: addStockData.notes,
      });

      handleCloseAddStockDialog();
      fetchData();
    } catch (err) {
      console.error('Error adding stock:', err);
      setError('Failed to add stock');
    }
  };

  const handleOpenAdjustStockDialog = (inventoryItem: PPEInventory) => {
    setSelectedInventory(inventoryItem);
    setAdjustStockData({
      adjustment_type: 'ADD',
      quantity: 0,
      reason: '',
      notes: '',
    });
    setOpenAdjustStockDialog(true);
  };

  const handleCloseAdjustStockDialog = () => {
    setOpenAdjustStockDialog(false);
    setSelectedInventory(null);
  };

  const handleAdjustStockSubmit = async () => {
    if (!selectedInventory) return;

    try {
      const adjustmentQuantity = adjustStockData.adjustment_type === 'ADD' 
        ? adjustStockData.quantity 
        : -adjustStockData.quantity;

      await axiosInstance.patch(`/ppes/inventory/${selectedInventory.id}/`, {
        current_stock: selectedInventory.current_stock + adjustmentQuantity,
        notes: `${adjustStockData.adjustment_type} - ${adjustStockData.reason}: ${adjustStockData.notes}`,
      });

      handleCloseAdjustStockDialog();
      fetchData();
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError('Failed to adjust stock');
    }
  };

  const getStockLevelColor = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100;
    if (percentage <= 25) return theme.palette.error.main;
    if (percentage <= 50) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStockLevelStatus = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100;
    if (percentage <= 25) return 'Critical';
    if (percentage <= 50) return 'Low';
    if (percentage <= 75) return 'Moderate';
    return 'Good';
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
            Inventory Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage PPE inventory, stock levels, and movements
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
            onClick={() => handleOpenAddStockDialog()}
          >
            Add Stock
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpenAdjustStockDialog()}
          >
            Adjust Stock
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettingsDialog(true)}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Stock Overview" />
          <Tab label="Stock Movements" />
          <Tab label="Low Stock Alerts" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Current Stock Levels
              </Typography>
              <Chip
                label={`${inventory.length} Categories`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Current Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Threshold</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Received</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Issued</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} hover>
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
                            <CategoryIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.ppe_category.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.ppe_category.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: getStockLevelColor(item.current_stock, item.ppe_category.low_stock_threshold),
                          }}
                        >
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
                          label={getStockLevelStatus(item.current_stock, item.ppe_category.low_stock_threshold)}
                          size="small"
                          color={
                            getStockLevelStatus(item.current_stock, item.ppe_category.low_stock_threshold) === 'Critical' ? 'error' :
                            getStockLevelStatus(item.current_stock, item.ppe_category.low_stock_threshold) === 'Low' ? 'warning' :
                            'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.total_received}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.total_issued}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(item.last_updated).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {user?.is_hsse_manager && (
                            <Tooltip title="Adjust Stock">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenAdjustStockDialog(item)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <InventoryIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Stock Movements
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Stock movement tracking will be implemented here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Low Stock Alerts
            </Typography>
            <Grid container spacing={2}>
              {inventory.filter(item => item.is_low_stock).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WarningIcon color="warning" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.ppe_category.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current: {item.current_stock} | Threshold: {item.ppe_category.low_stock_threshold}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((item.current_stock / item.ppe_category.low_stock_threshold) * 100, 100)}
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
                  </Card>
                </Grid>
              ))}
              {inventory.filter(item => item.is_low_stock).length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No low stock alerts at the moment
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Inventory Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {inventory.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Categories
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {inventory.filter(item => item.is_low_stock).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {inventory.reduce((sum, item) => sum + item.total_received, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Received
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {inventory.reduce((sum, item) => sum + item.total_issued, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Issued
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Add Stock Dialog */}
      <Dialog open={openAddStockDialog} onClose={handleCloseAddStockDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>PPE Category</InputLabel>
                  <Select
                    value={addStockData.ppe_category}
                    onChange={(e) => setAddStockData({ ...addStockData, ppe_category: e.target.value })}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={addStockData.quantity}
                  onChange={(e) => setAddStockData({ ...addStockData, quantity: parseInt(e.target.value) })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    value={addStockData.vendor}
                    onChange={(e) => setAddStockData({ ...addStockData, vendor: e.target.value })}
                    required
                  >
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost per Unit"
                  type="number"
                  value={addStockData.cost_per_unit}
                  onChange={(e) => setAddStockData({ ...addStockData, cost_per_unit: parseFloat(e.target.value) })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Batch Number"
                  value={addStockData.batch_number}
                  onChange={(e) => setAddStockData({ ...addStockData, batch_number: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={addStockData.notes}
                  onChange={(e) => setAddStockData({ ...addStockData, notes: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddStockDialog}>Cancel</Button>
          <Button onClick={handleAddStockSubmit} variant="contained">
            Add Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={openAdjustStockDialog} onClose={handleCloseAdjustStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adjust Stock - {selectedInventory?.ppe_category.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Adjustment Type</InputLabel>
              <Select
                value={adjustStockData.adjustment_type}
                onChange={(e) => setAdjustStockData({ ...adjustStockData, adjustment_type: e.target.value })}
                required
              >
                <MenuItem value="ADD">Add Stock</MenuItem>
                <MenuItem value="REMOVE">Remove Stock</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={adjustStockData.quantity}
              onChange={(e) => setAdjustStockData({ ...adjustStockData, quantity: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Reason"
              value={adjustStockData.reason}
              onChange={(e) => setAdjustStockData({ ...adjustStockData, reason: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Notes"
              value={adjustStockData.notes}
              onChange={(e) => setAdjustStockData({ ...adjustStockData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdjustStockDialog}>Cancel</Button>
          <Button onClick={handleAdjustStockSubmit} variant="contained">
            Adjust Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inventory Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.auto_low_stock_alerts}
                  onChange={(e) => setSettingsData({ ...settingsData, auto_low_stock_alerts: e.target.checked })}
                />
              }
              label="Auto Low Stock Alerts"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Low Stock Threshold Percentage"
              type="number"
              value={settingsData.low_stock_threshold_percentage}
              onChange={(e) => setSettingsData({ ...settingsData, low_stock_threshold_percentage: parseInt(e.target.value) })}
              margin="normal"
              helperText="Percentage of threshold to trigger low stock alerts"
            />
            <TextField
              fullWidth
              label="Expiry Alert Days"
              type="number"
              value={settingsData.expiry_alert_days}
              onChange={(e) => setSettingsData({ ...settingsData, expiry_alert_days: parseInt(e.target.value) })}
              margin="normal"
              helperText="Days before expiry to send alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.require_approval_for_adjustments}
                  onChange={(e) => setSettingsData({ ...settingsData, require_approval_for_adjustments: e.target.checked })}
                />
              }
              label="Require Approval for Stock Adjustments"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement; 