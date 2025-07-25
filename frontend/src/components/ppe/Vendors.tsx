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
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address: string;
  country: string;
  vendor_documents?: string;
  vendor_documents_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VendorPurchase {
  id: number;
  ppe_category: {
    name: string;
  };
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  purchase_date: string;
  purchase_order_number: string;
  invoice_number: string;
  received_by: {
    first_name: string;
    last_name: string;
  };
  notes: string;
}

interface VendorPerformance {
  total_purchases: number;
  total_spent: number;
  average_cost: number;
  last_purchase_date: string;
  purchase_frequency: number;
  reliability_score: number;
}

const Vendors: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorPurchases, setVendorPurchases] = useState<VendorPurchase[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openVendorDialog, setOpenVendorDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [openPerformanceDialog, setOpenPerformanceDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  // Form states
  const [vendorData, setVendorData] = useState({
    name: '',
    contact_person: '',
    phone_number: '',
    email: '',
    address: '',
    country: '',
    is_active: true,
  });

  const [documentData, setDocumentData] = useState({
    vendor_documents: null as File | null,
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/ppes/vendors/');
      setVendors(response.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPurchases = async (vendorId: number) => {
    try {
      const response = await axiosInstance.get(`/ppes/purchases/?vendor=${vendorId}`);
      setVendorPurchases(response.data);
    } catch (err) {
      console.error('Error fetching vendor purchases:', err);
    }
  };

  const fetchVendorPerformance = async (vendorId: number) => {
    try {
      const purchases = await axiosInstance.get(`/ppes/purchases/?vendor=${vendorId}`);
      const purchaseData = purchases.data;
      
      if (purchaseData.length > 0) {
        const totalPurchases = purchaseData.length;
        const totalSpent = purchaseData.reduce((sum: number, purchase: VendorPurchase) => sum + purchase.total_cost, 0);
        const averageCost = totalSpent / totalPurchases;
        const lastPurchaseDate = purchaseData[0].purchase_date;
        
        // Calculate purchase frequency (purchases per month)
        const firstPurchase = purchaseData[purchaseData.length - 1];
        const monthsDiff = (new Date(lastPurchaseDate).getTime() - new Date(firstPurchase.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
        const purchaseFrequency = monthsDiff > 0 ? totalPurchases / monthsDiff : totalPurchases;
        
        // Simple reliability score based on purchase consistency
        const reliabilityScore = Math.min(100, Math.max(0, 100 - (purchaseFrequency * 10)));
        
        setVendorPerformance({
          total_purchases: totalPurchases,
          total_spent: totalSpent,
          average_cost: averageCost,
          last_purchase_date: lastPurchaseDate,
          purchase_frequency: purchaseFrequency,
          reliability_score: reliabilityScore,
        });
      }
    } catch (err) {
      console.error('Error fetching vendor performance:', err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenVendorDialog = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorData({
        name: vendor.name,
        contact_person: vendor.contact_person,
        phone_number: vendor.phone_number,
        email: vendor.email,
        address: vendor.address,
        country: vendor.country,
        is_active: vendor.is_active,
      });
    } else {
      setEditingVendor(null);
      setVendorData({
        name: '',
        contact_person: '',
        phone_number: '',
        email: '',
        address: '',
        country: '',
        is_active: true,
      });
    }
    setOpenVendorDialog(true);
  };

  const handleCloseVendorDialog = () => {
    setOpenVendorDialog(false);
    setEditingVendor(null);
  };

  const handleVendorSubmit = async () => {
    try {
      if (editingVendor) {
        await axiosInstance.put(`/ppes/vendors/${editingVendor.id}/`, vendorData);
      } else {
        await axiosInstance.post('/ppes/vendors/', vendorData);
      }
      handleCloseVendorDialog();
      fetchVendors();
    } catch (err) {
      console.error('Error saving vendor:', err);
      setError('Failed to save vendor');
    }
  };

  const handleDeleteVendor = async (vendorId: number) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await axiosInstance.delete(`/ppes/vendors/${vendorId}/`);
        fetchVendors();
      } catch (err) {
        console.error('Error deleting vendor:', err);
        setError('Failed to delete vendor');
      }
    }
  };

  const handleOpenDocumentDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDocumentData({ vendor_documents: null });
    setOpenDocumentDialog(true);
  };

  const handleCloseDocumentDialog = () => {
    setOpenDocumentDialog(false);
    setSelectedVendor(null);
  };

  const handleDocumentSubmit = async () => {
    if (!selectedVendor || !documentData.vendor_documents) return;

    try {
      const formData = new FormData();
      formData.append('vendor_documents', documentData.vendor_documents);
      
      await axiosInstance.patch(`/ppes/vendors/${selectedVendor.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleCloseDocumentDialog();
      fetchVendors();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    }
  };

  const handleOpenPerformanceDialog = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    await Promise.all([
      fetchVendorPurchases(vendor.id),
      fetchVendorPerformance(vendor.id),
    ]);
    setOpenPerformanceDialog(true);
  };

  const handleClosePerformanceDialog = () => {
    setOpenPerformanceDialog(false);
    setSelectedVendor(null);
    setVendorPurchases([]);
    setVendorPerformance(null);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // Common countries for dropdown
  const COUNTRIES = [
    { value: 'GH', label: 'Ghana' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'KE', label: 'Kenya' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'EG', label: 'Egypt' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japan' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
  ];

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
            Vendor Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage PPE vendors, suppliers, and performance tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchVendors}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenVendorDialog()}
          >
            Add Vendor
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
          <Tab label="All Vendors" />
          <Tab label="Active Vendors" />
          <Tab label="Performance Overview" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Vendors ({vendors.length})
              </Typography>
              <Chip
                label={`${vendors.filter(v => v.is_active).length} Active`}
                color="success"
                variant="outlined"
              />
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Documents</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id} hover>
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
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {vendor.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {vendor.contact_person}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16 }} />
                            {vendor.phone_number}
                          </Typography>
                          {vendor.email && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 16 }} />
                              {vendor.email}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 16 }} />
                            {vendor.country}
                          </Typography>
                          {vendor.address && (
                            <Typography variant="caption" color="text.secondary">
                              {vendor.address}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {vendor.vendor_documents_url ? (
                          <Tooltip title="Download Document">
                            <IconButton
                              size="small"
                              component={Link}
                              href={vendor.vendor_documents_url}
                              target="_blank"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No documents
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vendor.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={vendor.is_active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Performance">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenPerformanceDialog(vendor)}
                            >
                              <TrendingUpIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Upload Document">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDocumentDialog(vendor)}
                            >
                              <DescriptionIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenVendorDialog(vendor)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteVendor(vendor.id)}
                            >
                              <DeleteIcon />
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
              Active Vendors ({vendors.filter(v => v.is_active).length})
            </Typography>
            <Grid container spacing={2}>
              {vendors.filter(v => v.is_active).map((vendor) => (
                <Grid item xs={12} sm={6} md={4} key={vendor.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {vendor.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {vendor.contact_person}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {vendor.phone_number}
                      </Typography>
                    </Box>
                    {vendor.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {vendor.email}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {vendor.country}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Vendor Performance Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {vendors.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Vendors
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {vendors.filter(v => v.is_active).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Vendors
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {vendors.filter(v => v.vendor_documents).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    With Documents
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {vendors.filter(v => v.country).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    International
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Vendor Dialog */}
      <Dialog open={openVendorDialog} onClose={handleCloseVendorDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  value={vendorData.name}
                  onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={vendorData.contact_person}
                  onChange={(e) => setVendorData({ ...vendorData, contact_person: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={vendorData.phone_number}
                  onChange={(e) => setVendorData({ ...vendorData, phone_number: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={vendorData.email}
                  onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={vendorData.address}
                  onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={vendorData.country}
                    onChange={(e) => setVendorData({ ...vendorData, country: e.target.value })}
                    label="Country"
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>
                        {country.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={vendorData.is_active}
                      onChange={(e) => setVendorData({ ...vendorData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVendorDialog}>Cancel</Button>
          <Button onClick={handleVendorSubmit} variant="contained">
            {editingVendor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={openDocumentDialog} onClose={handleCloseDocumentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Document - {selectedVendor?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <input
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="document-upload"
              type="file"
              onChange={(e) => setDocumentData({ vendor_documents: e.target.files?.[0] || null })}
            />
            <label htmlFor="document-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<DescriptionIcon />}
                sx={{ mb: 2 }}
              >
                Choose File
              </Button>
            </label>
            {documentData.vendor_documents && (
              <Typography variant="body2" color="text.secondary">
                Selected: {documentData.vendor_documents.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocumentDialog}>Cancel</Button>
          <Button 
            onClick={handleDocumentSubmit} 
            variant="contained"
            disabled={!documentData.vendor_documents}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={openPerformanceDialog} onClose={handleClosePerformanceDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Vendor Performance - {selectedVendor?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {vendorPerformance && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {vendorPerformance.total_purchases}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Purchases
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      ${vendorPerformance.total_spent.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                      {vendorPerformance.purchase_frequency.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchases/Month
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: getPerformanceColor(vendorPerformance.reliability_score) 
                      }}
                    >
                      {vendorPerformance.reliability_score.toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reliability Score
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Purchase History
            </Typography>
            {vendorPurchases.length > 0 ? (
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Received By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendorPurchases.slice(0, 10).map((purchase) => (
                      <TableRow key={purchase.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {purchase.ppe_category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {purchase.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ${purchase.cost_per_unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${purchase.total_cost}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {purchase.received_by.first_name} {purchase.received_by.last_name}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No purchase history available
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePerformanceDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors; 