import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Badge,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Pending as PendingIcon,
  CheckCircleOutline as ApprovedIcon,
  CancelOutlined as RejectedIcon,
  LocalShipping as IssuedIcon
} from '@mui/icons-material';
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";

interface PPECategory {
  id: number;
  name: string;
  description: string;
  lifespan_months: number;
  low_stock_threshold: number;
  is_active: boolean;
}

interface PPERequest {
  id: number;
  employee: number;
  employee_name: string;
  ppe_category: number;
  ppe_category_name: string;
  quantity: number;
  reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED';
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

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
      id={`requests-tabpanel-${index}`}
      aria-labelledby={`requests-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PPERequest[]>([]);
  const [categories, setCategories] = useState<PPECategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PPERequest | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    ppe_category: '',
    quantity: 1,
    reason: '',
    urgency: 'MEDIUM'
  });

  const isHSSEManager = user?.position === 'HSSE MANAGER';

  useEffect(() => {
    fetchRequests();
    fetchCategories();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ppes/requests/');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({ open: true, message: 'Error fetching requests', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/ppes/categories/');
      setCategories(response.data.filter((cat: PPECategory) => cat.is_active));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      const response = await axiosInstance.post('/ppes/requests/', formData);
      setSnackbar({ open: true, message: 'Request submitted successfully', severity: 'success' });
      setOpenDialog(false);
      setFormData({ ppe_category: '', quantity: 1, reason: '', urgency: 'MEDIUM' });
      fetchRequests();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      const message = error.response?.data?.error || 'Error submitting request';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleApproveRequest = async (requestId: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    try {
      const data: any = { status };
      if (status === 'REJECTED' && rejectionReason) {
        data.rejection_reason = rejectionReason;
      }
      
      await axiosInstance.post(`/ppes/requests/${requestId}/approve/`, data);
      setSnackbar({ open: true, message: `Request ${status.toLowerCase()} successfully`, severity: 'success' });
      setOpenApprovalDialog(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      const message = error.response?.data?.error || 'Error processing request';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'ISSUED': return 'info';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'URGENT': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <PendingIcon />;
      case 'APPROVED': return <ApprovedIcon />;
      case 'REJECTED': return <RejectedIcon />;
      case 'ISSUED': return <IssuedIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.ppe_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || request.urgency === filterUrgency;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getTabRequests = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: return filteredRequests; // All
      case 1: return filteredRequests.filter(r => r.status === 'PENDING');
      case 2: return filteredRequests.filter(r => r.status === 'APPROVED');
      case 3: return filteredRequests.filter(r => r.status === 'REJECTED');
      case 4: return filteredRequests.filter(r => r.status === 'ISSUED');
      default: return filteredRequests;
    }
  };

  const getRequestCounts = () => {
    const counts = {
      all: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length,
      issued: requests.filter(r => r.status === 'ISSUED').length
    };
    return counts;
  };

  const counts = getRequestCounts();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            PPE Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage PPE requests and approvals
          </Typography>
        </Box>
        {!isHSSEManager && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            New Request
          </Button>
        )}
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {counts.all}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Requests
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
              {counts.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {counts.approved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
              {counts.rejected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejected
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {counts.issued}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Issued
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="ISSUED">Issued</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  label="Urgency"
                >
                  <MenuItem value="all">All Urgency</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchRequests}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={
                <Badge badgeContent={counts.all} color="primary">
                  All
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.pending} color="warning">
                  Pending
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.approved} color="success">
                  Approved
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.rejected} color="error">
                  Rejected
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.issued} color="info">
                  Issued
                </Badge>
              } 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <RequestTable 
            requests={getTabRequests(0)}
            isHSSEManager={isHSSEManager}
            onView={(request) => {
              setSelectedRequest(request);
              setOpenViewDialog(true);
            }}
            onApprove={(request) => {
              setSelectedRequest(request);
              setOpenApprovalDialog(true);
            }}
            getStatusColor={getStatusColor}
            getUrgencyColor={getUrgencyColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <RequestTable 
            requests={getTabRequests(1)}
            isHSSEManager={isHSSEManager}
            onView={(request) => {
              setSelectedRequest(request);
              setOpenViewDialog(true);
            }}
            onApprove={(request) => {
              setSelectedRequest(request);
              setOpenApprovalDialog(true);
            }}
            getStatusColor={getStatusColor}
            getUrgencyColor={getUrgencyColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <RequestTable 
            requests={getTabRequests(2)}
            isHSSEManager={isHSSEManager}
            onView={(request) => {
              setSelectedRequest(request);
              setOpenViewDialog(true);
            }}
            onApprove={(request) => {
              setSelectedRequest(request);
              setOpenApprovalDialog(true);
            }}
            getStatusColor={getStatusColor}
            getUrgencyColor={getUrgencyColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <RequestTable 
            requests={getTabRequests(3)}
            isHSSEManager={isHSSEManager}
            onView={(request) => {
              setSelectedRequest(request);
              setOpenViewDialog(true);
            }}
            onApprove={(request) => {
              setSelectedRequest(request);
              setOpenApprovalDialog(true);
            }}
            getStatusColor={getStatusColor}
            getUrgencyColor={getUrgencyColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <RequestTable 
            requests={getTabRequests(4)}
            isHSSEManager={isHSSEManager}
            onView={(request) => {
              setSelectedRequest(request);
              setOpenViewDialog(true);
            }}
            onApprove={(request) => {
              setSelectedRequest(request);
              setOpenApprovalDialog(true);
            }}
            getStatusColor={getStatusColor}
            getUrgencyColor={getUrgencyColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New PPE Request</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>PPE Category</InputLabel>
              <Select
                value={formData.ppe_category}
                onChange={(e) => setFormData({ ...formData, ppe_category: e.target.value })}
                label="PPE Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                label="Urgency"
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a detailed reason for your request..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={!formData.ppe_category || !formData.reason}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Employee</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.employee_name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">PPE Category</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.ppe_category_name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.quantity}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Urgency</Typography>
                  <Chip 
                    label={selectedRequest.urgency} 
                    color={getUrgencyColor(selectedRequest.urgency) as any}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.reason}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedRequest.status} 
                    color={getStatusColor(selectedRequest.status) as any}
                    icon={getStatusIcon(selectedRequest.status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                {selectedRequest.rejection_reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Rejection Reason</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.rejection_reason}</Typography>
                  </Grid>
                )}
                {selectedRequest.approved_by_name && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.approved_by_name}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {isHSSEManager && selectedRequest?.status === 'PENDING' && (
            <Button 
              onClick={() => {
                setOpenViewDialog(false);
                setOpenApprovalDialog(true);
              }}
              variant="contained"
            >
              Process Request
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Process request for {selectedRequest.employee_name} - {selectedRequest.ppe_category_name}
              </Typography>
              <TextField
                fullWidth
                label="Rejection Reason (if rejecting)"
                multiline
                rows={3}
                id="rejection-reason"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprovalDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              const rejectionReason = (document.getElementById('rejection-reason') as HTMLInputElement)?.value;
              if (selectedRequest) {
                handleApproveRequest(selectedRequest.id, 'REJECTED', rejectionReason);
              }
            }}
            color="error"
            variant="outlined"
          >
            Reject
          </Button>
          <Button 
            onClick={() => {
              if (selectedRequest) {
                handleApproveRequest(selectedRequest.id, 'APPROVED');
              }
            }}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface RequestTableProps {
  requests: PPERequest[];
  isHSSEManager: boolean;
  onView: (request: PPERequest) => void;
  onApprove: (request: PPERequest) => void;
  getStatusColor: (status: string) => string;
  getUrgencyColor: (urgency: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  isHSSEManager,
  onView,
  onApprove,
  getStatusColor,
  getUrgencyColor,
  getStatusIcon
}) => {
  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No requests found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>PPE Category</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Urgency</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} hover>
              <TableCell>{request.employee_name}</TableCell>
              <TableCell>{request.ppe_category_name}</TableCell>
              <TableCell>{request.quantity}</TableCell>
              <TableCell>
                <Chip 
                  label={request.urgency} 
                  color={getUrgencyColor(request.urgency) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={request.status} 
                  color={getStatusColor(request.status) as any}
                  icon={getStatusIcon(request.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(request.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onView(request)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {isHSSEManager && request.status === 'PENDING' && (
                    <Tooltip title="Process Request">
                      <IconButton size="small" onClick={() => onApprove(request)}>
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Requests; 