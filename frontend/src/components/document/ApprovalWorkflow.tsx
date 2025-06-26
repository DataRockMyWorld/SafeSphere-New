import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Description as DocumentIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  status: string;
  version: string;
  revision_number: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
  };
  content?: string;
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
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ApprovalWorkflow: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | 'view'>('view');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/documents/');
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleApprove = (document: Document) => {
    setSelectedDocument(document);
    setDialogType('approve');
    setComment('');
    setDialogOpen(true);
  };

  const handleReject = (document: Document) => {
    setSelectedDocument(document);
    setDialogType('reject');
    setComment('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedDocument) return;

    try {
      setSubmitting(true);
      const action = dialogType === 'approve' ? 'approve' : 'reject';
      
      let endpoint = '';
      if (selectedDocument.status === 'HSSE_REVIEW' && user?.position === 'HSSE MANAGER') {
        endpoint = `/documents/${selectedDocument.id}/ops-review/`;
      } else if (selectedDocument.status === 'OPS_REVIEW' && user?.position === 'OPS MANAGER') {
        endpoint = `/documents/${selectedDocument.id}/ops-review/`;
      } else if (selectedDocument.status === 'MD_APPROVAL' && user?.position === 'MD') {
        endpoint = `/documents/${selectedDocument.id}/md-approval/`;
      }

      await axiosInstance.post(endpoint, {
        action: action,
        comment: comment,
      });
      
      setDialogOpen(false);
      setSelectedDocument(null);
      setComment('');
      fetchDocuments(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage || `Failed to ${dialogType} document`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return theme.palette.info.main;
      case 'HSSE_REVIEW':
        return theme.palette.warning.main;
      case 'OPS_REVIEW':
        return theme.palette.warning.main;
      case 'MD_APPROVAL':
        return theme.palette.warning.main;
      case 'APPROVED':
        return theme.palette.success.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const canTakeAction = (document: Document) => {
    if (user?.position === 'HSSE MANAGER' && document.status === 'HSSE_REVIEW') {
      return true;
    }
    if (user?.position === 'OPS MANAGER' && document.status === 'OPS_REVIEW') {
      return true;
    }
    if (user?.position === 'MD' && document.status === 'MD_APPROVAL') {
      return true;
    }
    return false;
  };

  const getDocumentsForTab = () => {
    switch (tabValue) {
      case 0: // Pending Review
        return documents.filter(doc => 
          doc.status === 'HSSE_REVIEW' || 
          doc.status === 'OPS_REVIEW' || 
          doc.status === 'MD_APPROVAL'
        );
      case 1: // My Documents
        return documents.filter(doc => doc.created_by.id === user?.id);
      case 2: // All Documents
        return documents;
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Approval Workflow
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Pending Review" />
          <Tab label="My Documents" />
          <Tab label="All Documents" />
        </Tabs>
      </Box>

      {/* Documents Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDocumentsForTab().map((document) => (
              <TableRow key={document.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {document.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={document.document_type}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={document.status}
                    size="small"
                    sx={{
                      backgroundColor: `${getStatusColor(document.status)}20`,
                      color: getStatusColor(document.status),
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>v{document.version}.{document.revision_number}</TableCell>
                <TableCell>{document.created_by.name}</TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleView(document)}
                      sx={{ color: theme.palette.info.main }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {canTakeAction(document) && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => handleApprove(document)}
                          sx={{ color: theme.palette.success.main }}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          onClick={() => handleReject(document)}
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
          {dialogType === 'view' && 'Document Details'}
          {dialogType === 'approve' && 'Approve Document'}
          {dialogType === 'reject' && 'Reject Document'}
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDocument.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedDocument.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={selectedDocument.document_type} color="primary" variant="outlined" />
                <Chip 
                  label={selectedDocument.status} 
                  sx={{
                    backgroundColor: `${getStatusColor(selectedDocument.status)}20`,
                    color: getStatusColor(selectedDocument.status),
                  }}
                />
                <Chip label={`v${selectedDocument.version}.${selectedDocument.revision_number}`} variant="outlined" />
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Created by {selectedDocument.created_by.name} on {formatDate(selectedDocument.created_at)}
              </Typography>

              {selectedDocument.content && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Document Content:
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.grey[50], maxHeight: 200, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedDocument.content}
                    </Typography>
                  </Paper>
                </>
              )}

              {(dialogType === 'approve' || dialogType === 'reject') && (
                <TextField
                  fullWidth
                  label={`${dialogType === 'approve' ? 'Approval' : 'Rejection'} Comment (Optional)`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder={`Enter your ${dialogType === 'approve' ? 'approval' : 'rejection'} comment...`}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {dialogType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {(dialogType === 'approve' || dialogType === 'reject') && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              color={dialogType === 'approve' ? 'success' : 'error'}
            >
              {submitting ? 'Processing...' : (dialogType === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalWorkflow; 