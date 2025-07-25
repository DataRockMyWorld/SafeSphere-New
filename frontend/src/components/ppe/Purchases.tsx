import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
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
  Alert,
  CircularProgress,
  Tooltip,
  Fab,
  Divider,
  Stack,
  Avatar,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Done as DoneIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

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
      id={`purchases-tabpanel-${index}`}
      aria-labelledby={`purchases-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface Purchase {
  id: number;
  vendor: {
    id: number;
    name: string;
    contact_person: string;
    email: string;
  };
  ppe_category: {
    id: number;
    name: string;
    description: string;
  };
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  purchase_date: string;
  purchase_order_number: string;
  invoice_number: string;
  receipt_document_url?: string;
  received_by: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  notes: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  is_active: boolean;
}

interface PPECategory {
  id: number;
  name: string;
  description: string;
  lifespan_months: number;
  low_stock_threshold: number;
  is_active: boolean;
}

interface PurchaseFormData {
  vendor: number;
  ppe_category: number;
  quantity: number;
  cost_per_unit: number;
  purchase_date: Date | null;
  invoice_number: string;
  notes: string;
}

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [ppeCategories, setPPECategories] = useState<PPECategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [formData, setFormData] = useState<PurchaseFormData>({
    vendor: 0,
    ppe_category: 0,
    quantity: 1,
    cost_per_unit: 0,
    purchase_date: new Date(),
    invoice_number: '',
    notes: ''
  });

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    averageCost: 0,
    topVendors: [],
    topCategories: [],
    monthlySpending: []
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusMenuPurchase, setStatusMenuPurchase] = useState<Purchase | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receivePurchase, setReceivePurchase] = useState<Purchase | null>(null);
  const [receiveForm, setReceiveForm] = useState({
    received_quantity: 0,
    damaged_quantity: 0,
    quality_check_passed: true,
    notes: '',
    received_date: new Date(),
  });
  const [receiveError, setReceiveError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (receiveDialogOpen && receivePurchase) {
      setReceiveForm({
        received_quantity: receivePurchase.quantity,
        damaged_quantity: 0,
        quality_check_passed: true,
        notes: '',
        received_date: new Date(),
      });
      setReceiveError(null);
    }
  }, [receiveDialogOpen, receivePurchase]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, vendorsRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/ppes/purchases/'),
        axiosInstance.get('/ppes/vendors/'),
        axiosInstance.get('/ppes/categories/')
      ]);

      setPurchases(purchasesRes.data.results || purchasesRes.data);
      setVendors(vendorsRes.data.results || vendorsRes.data);
      setPPECategories(categoriesRes.data.results || categoriesRes.data);

      // Calculate analytics
      calculateAnalytics(purchasesRes.data.results || purchasesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch purchases data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (purchaseData: Purchase[]) => {
    const totalPurchases = purchaseData.length;
    const totalSpent = purchaseData.reduce((sum, purchase) => sum + Number(purchase.total_cost), 0);
    const averageCost = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Top vendors by total spent
    const vendorSpending = purchaseData.reduce((acc, purchase) => {
      const vendorName = purchase.vendor.name;
      acc[vendorName] = (acc[vendorName] || 0) + Number(purchase.total_cost);
      return acc;
    }, {} as Record<string, number>);

    const topVendors = Object.entries(vendorSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Top categories by quantity
    const categoryQuantities = purchaseData.reduce((acc, purchase) => {
      const categoryName = purchase.ppe_category.name;
      acc[categoryName] = (acc[categoryName] || 0) + purchase.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryQuantities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    setAnalytics({
      totalPurchases,
      totalSpent,
      averageCost,
      topVendors,
      topCategories,
      monthlySpending: []
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (purchase?: Purchase) => {
    if (purchase) {
      setEditingPurchase(purchase);
      setFormData({
        vendor: purchase.vendor.id,
        ppe_category: purchase.ppe_category.id,
        quantity: purchase.quantity,
        cost_per_unit: Number(purchase.cost_per_unit),
        purchase_date: parseISO(purchase.purchase_date),
        invoice_number: purchase.invoice_number,
        notes: purchase.notes
      });
    } else {
      setEditingPurchase(null);
      setFormData({
        vendor: 0,
        ppe_category: 0,
        quantity: 1,
        cost_per_unit: 0,
        purchase_date: new Date(),
        invoice_number: '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPurchase(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.vendor || !formData.ppe_category || !formData.purchase_date) {
        setError('Please fill in all required fields');
        return;
      }

      const total_cost = formData.quantity * formData.cost_per_unit;
      
      const purchaseData = {
        ...formData,
        total_cost: total_cost,
        purchase_date: format(formData.purchase_date!, 'yyyy-MM-dd'),
        received_by: user?.id
      };

      if (editingPurchase) {
        await axiosInstance.put(`/ppes/purchases/${editingPurchase.id}/`, purchaseData);
      } else {
        await axiosInstance.post('/ppes/purchases/', purchaseData);
      }

      handleCloseDialog();
      fetchData();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save purchase');
    }
  };

  const handleDelete = async (purchaseId: number) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await axiosInstance.delete(`/ppes/purchases/${purchaseId}/`);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete purchase');
      }
    }
  };

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, purchase: Purchase) => {
    setAnchorEl(event.currentTarget);
    setStatusMenuPurchase(purchase);
  };
  const handleStatusMenuClose = () => {
    setAnchorEl(null);
    setStatusMenuPurchase(null);
  };
  const handleStatusChange = async (purchase: Purchase, newStatus: string) => {
    try {
      await axiosInstance.post(`/ppes/purchases/${purchase.id}/status/`, { status: newStatus });
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      handleStatusMenuClose();
    }
  };
  const handleOpenReceiveDialog = (purchase: Purchase) => {
    setReceivePurchase(purchase);
    setReceiveDialogOpen(true);
  };
  const handleCloseReceiveDialog = () => {
    setReceiveDialogOpen(false);
    setReceivePurchase(null);
  };

  const handleReceiveSubmit = async () => {
    if (!receivePurchase) return;
    if (receiveForm.received_quantity <= 0) {
      setReceiveError('Received quantity must be greater than 0');
      return;
    }
    if (receiveForm.damaged_quantity > receiveForm.received_quantity) {
      setReceiveError('Damaged quantity cannot exceed received quantity');
      return;
    }
    if (receiveForm.received_quantity > receivePurchase.quantity) {
      setReceiveError('Received quantity cannot exceed ordered quantity');
      return;
    }
    try {
      await axiosInstance.post(`/ppes/purchases/${receivePurchase.id}/receipt/`, {
        ...receiveForm,
        received_date: format(receiveForm.received_date, 'yyyy-MM-dd'),
      });
      handleCloseReceiveDialog();
      fetchData();
    } catch (err: any) {
      setReceiveError(err.response?.data?.error || 'Failed to record receipt');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Purchases
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage PPE purchases and procurement
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Purchase
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="All Purchases" />
            <Tab label="Recent Purchases" />
            <Tab label="Analytics" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Purchase Details</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vendor</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cost</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Receipt</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {purchase.purchase_order_number || 'No PO'}
                          </Typography>
                          {purchase.invoice_number && (
                            <Typography variant="caption" color="text.secondary">
                              Invoice: {purchase.invoice_number}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon color="action" fontSize="small" />
                          <Typography variant="body2">{purchase.vendor.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon color="action" fontSize="small" />
                          <Typography variant="body2">{purchase.ppe_category.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={purchase.quantity} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(Number(purchase.total_cost))}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(Number(purchase.cost_per_unit))} each
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {format(parseISO(purchase.purchase_date), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {purchase.receipt_document_url ? (
                          <Tooltip title="View Receipt">
                            <IconButton size="small" color="primary" onClick={() => window.open(purchase.receipt_document_url, '_blank')}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">N/A</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={purchase.status}
                          color={
                            purchase.status === 'RECEIVED' ? 'success' :
                            purchase.status === 'CANCELLED' ? 'default' :
                            purchase.status === 'SHIPPED' ? 'info' :
                            purchase.status === 'CONFIRMED' ? 'primary' :
                            'warning'
                          }
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(purchase)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(purchase.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          {user?.position === 'HSSE MANAGER' && (
                            <>
                              <Tooltip title="Change Status">
                                <IconButton size="small" onClick={(e) => handleStatusMenuOpen(e, purchase)}>
                                  <AssignmentTurnedInIcon />
                                </IconButton>
                              </Tooltip>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && statusMenuPurchase?.id === purchase.id}
                                onClose={handleStatusMenuClose}
                              >
                                <MenuItem onClick={() => handleStatusChange(purchase, 'CONFIRMED')}>
                                  <ListItemIcon><DoneIcon fontSize="small" /></ListItemIcon>
                                  <ListItemText>Confirm</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleStatusChange(purchase, 'SHIPPED')}>
                                  <ListItemIcon><LocalShippingIcon fontSize="small" /></ListItemIcon>
                                  <ListItemText>Mark as Shipped</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleStatusChange(purchase, 'CANCELLED')}>
                                  <ListItemIcon><CancelIcon fontSize="small" /></ListItemIcon>
                                  <ListItemText>Cancel</ListItemText>
                                </MenuItem>
                              </Menu>
                              {(purchase.status === 'CONFIRMED' || purchase.status === 'SHIPPED') && (
                                <Tooltip title="Receive Stock">
                                  <IconButton size="small" color="success" onClick={() => handleOpenReceiveDialog(purchase)}>
                                    <LocalShippingIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
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
            <Grid container spacing={3}>
              {purchases.slice(0, 6).map((purchase) => (
                <Grid item xs={12} md={6} lg={4} key={purchase.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {purchase.ppe_category.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {purchase.vendor.name}
                          </Typography>
                        </Box>
                        <Chip label={formatCurrency(Number(purchase.total_cost))} color="primary" size="small" />
                      </Box>
                      
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Quantity:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{purchase.quantity}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Date:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {format(parseISO(purchase.purchase_date), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                        {purchase.received_by && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Received by:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {purchase.received_by.first_name} {purchase.received_by.last_name}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => handleOpenDialog(purchase)}>
                          Edit
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(purchase.id)}>
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CartIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {analytics.totalPurchases}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Purchases
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <MoneyIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {formatCurrency(analytics.totalSpent)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <TrendingUpIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {formatCurrency(analytics.averageCost)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Cost
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {vendors.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Vendors
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Top Vendors by Spending
                    </Typography>
                    <Stack spacing={2}>
                      {analytics.topVendors.map((vendor, index) => (
                        <Box key={vendor.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{vendor.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(vendor.amount)}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(vendor.amount / analytics.totalSpent) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Top Categories by Quantity
                    </Typography>
                    <Stack spacing={2}>
                      {analytics.topCategories.map((category, index) => (
                        <Box key={category.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{category.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {category.quantity} units
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(category.quantity / Math.max(...analytics.topCategories.map(c => c.quantity))) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Add/Edit Purchase Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vendor *</InputLabel>
                <Select
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: Number(e.target.value) })}
                  label="Vendor *"
                >
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>PPE Category *</InputLabel>
                <Select
                  value={formData.ppe_category}
                  onChange={(e) => setFormData({ ...formData, ppe_category: Number(e.target.value) })}
                  label="PPE Category *"
                >
                  {ppeCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
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
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost per Unit *"
                type="number"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date *"
                  value={formData.purchase_date}
                  onChange={(date) => setFormData({ ...formData, purchase_date: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Total Cost: {formatCurrency(formData.quantity * formData.cost_per_unit)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPurchase ? 'Update' : 'Create'} Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receive Purchase Dialog */}
      <Dialog open={receiveDialogOpen} onClose={handleCloseReceiveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Receive Purchase Order</DialogTitle>
        <DialogContent>
          {receivePurchase && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Receiving PO <strong>{receivePurchase.purchase_order_number}</strong> for <strong>{receivePurchase.ppe_category.name}</strong> (Ordered: {receivePurchase.quantity})
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Received Quantity"
                    type="number"
                    value={receiveForm.received_quantity}
                    onChange={e => setReceiveForm(f => ({ ...f, received_quantity: parseInt(e.target.value) || 0 }))}
                    inputProps={{ min: 1, max: receivePurchase.quantity }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Damaged Quantity"
                    type="number"
                    value={receiveForm.damaged_quantity}
                    onChange={e => setReceiveForm(f => ({ ...f, damaged_quantity: parseInt(e.target.value) || 0 }))}
                    inputProps={{ min: 0, max: receiveForm.received_quantity }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Quality Check</InputLabel>
                    <Select
                      value={receiveForm.quality_check_passed ? 'yes' : 'no'}
                      label="Quality Check"
                      onChange={e => setReceiveForm(f => ({ ...f, quality_check_passed: e.target.value === 'yes' }))}
                    >
                      <MenuItem value="yes">Passed</MenuItem>
                      <MenuItem value="no">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Received Date"
                      value={receiveForm.received_date}
                      onChange={date => setReceiveForm(f => ({ ...f, received_date: date || new Date() }))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={receiveForm.notes}
                    onChange={e => setReceiveForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </Grid>
              </Grid>
              {receiveError && <Alert severity="error" sx={{ mt: 2 }}>{receiveError}</Alert>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceiveDialog}>Cancel</Button>
          <Button onClick={handleReceiveSubmit} variant="contained" color="success">
            Record Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Purchases; 