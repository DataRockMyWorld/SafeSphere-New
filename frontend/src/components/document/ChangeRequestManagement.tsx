import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface ChangeRequest {
  id: number;
  document: {
    id: string;
    title: string;
    document_type: string;
    status: string;
  };
  requested_by: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    position: string;
  } | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_response: string;
  created_at: string;
  responded_at?: string;
  responded_by?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    position: string;
  } | null;
}

const ChangeRequestManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | 'view'>('view');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user has permission to access this page
  useEffect(() => {
    if (user && user.position !== 'HSSE MANAGER') {
      setError('Access denied. Only HSSE Managers can manage change requests.');
      setLoading(false);
      return;
    }
    fetchChangeRequests();
  }, [user]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/documents/change-requests/');
      setChangeRequests(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch change requests');
      console.error('Error fetching change requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleApprove = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setDialogType('approve');
    setResponse('');
    setDialogOpen(true);
  };

  const handleReject = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setDialogType('reject');
    setResponse('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      const endpoint = dialogType === 'approve' ? 'approve' : 'reject';
      await axiosInstance.post(`/change-requests/${selectedRequest.id}/${endpoint}/`, {
        response: response,
      });
      
      setDialogOpen(false);
      setSelectedRequest(null);
      setResponse('');
      fetchChangeRequests(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage || `Failed to ${dialogType} change request`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return theme.palette.warning.main;
      case 'APPROVED':
        return theme.palette.success.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has permission
  if (user && user.position !== 'HSSE MANAGER') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Access denied. Only HSSE Managers can manage change requests.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/document-management/library')}>
          Back to Document Library
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Change Request Management
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Change Requests Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeRequests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.document.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.document.document_type}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{request.requested_by?.full_name || 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {request.reason}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    size="small"
                    sx={{
                      backgroundColor: `${getStatusColor(request.status)}20`,
                      color: getStatusColor(request.status),
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleView(request)}
                      sx={{ color: theme.palette.info.main }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {request.status === 'PENDING' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => handleApprove(request)}
                          sx={{ color: theme.palette.success.main }}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          onClick={() => handleReject(request)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for View/Approve/Reject */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'view' && 'Change Request Details'}
          {dialogType === 'approve' && 'Approve Change Request'}
          {dialogType === 'reject' && 'Reject Change Request'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Document: {selectedRequest.document.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Requested by: {selectedRequest.requested_by?.full_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Created: {new Date(selectedRequest.created_at).toLocaleString()}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Reason for Change:
              </Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.grey[50] }}>
                <Typography variant="body2">
                  {selectedRequest.reason}
                </Typography>
              </Paper>

              {selectedRequest.admin_response && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Admin Response:
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.grey[50] }}>
                    <Typography variant="body2">
                      {selectedRequest.admin_response}
                    </Typography>
                  </Paper>
                </>
              )}

              {(dialogType === 'approve' || dialogType === 'reject') && (
                <TextField
                  fullWidth
                  label={`${dialogType === 'approve' ? 'Approval' : 'Rejection'} Response (Optional)`}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder={`Enter your ${dialogType === 'approve' ? 'approval' : 'rejection'} response...`}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ fontSize: '0.8rem', py: 0.5 }}
          >
            {dialogType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {(dialogType === 'approve' || dialogType === 'reject') && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              color={dialogType === 'approve' ? 'success' : 'error'}
              size="small"
              sx={{ fontSize: '0.8rem', py: 0.5 }}
            >
              {submitting ? 'Processing...' : (dialogType === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeRequestManagement; 