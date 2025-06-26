import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Grid,
  Link,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface User {
  id: number;
  full_name: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  file: string;
  created_at: string;
}

interface Record {
  id: string;
  form_document: Document;
  submitted_by: User;
  submitted_file: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_by?: User;
  reviewed_at?: string;
  rejection_reason?: string;
}

// Dialog for submitting a new record
const SubmitRecordDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, onClose, onSuccess }) => {
  const [templates, setTemplates] = useState<Document[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchDocuments = async () => {
        try {
          const response = await axiosInstance.get('/documents/?category=FORM');
          setTemplates(response.data);
        } catch (err) {
          setError('Failed to load form templates.');
        }
      };
      fetchDocuments();
    } else {
      setSelectedTemplate(null);
      setSelectedFile(null);
      setError(null);
    }
  }, [open]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId) || null;
    setSelectedTemplate(template);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !selectedFile) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append('form_document_id', selectedTemplate.id);
    formData.append('submitted_file', selectedFile);
    try {
      await axiosInstance.post('/records/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Failed to submit record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Submit New Record</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
          <InputLabel>Choose Form Template</InputLabel>
          <Select
            value={selectedTemplate?.id || ''}
            label="Choose Form Template"
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            {templates.map(template => (
              <MenuItem key={template.id} value={template.id}>{template.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedTemplate && (
          <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Upload Completed Form (PDF, Word, Excel, Images)
              <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
            </Button>
            {selectedFile && <Typography sx={{ mt: 1 }}>{selectedFile.name}</Typography>}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!selectedTemplate || !selectedFile || submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialog for viewing record details
const RecordDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  record: Record | null;
}> = ({ open, onClose, record }) => {
  if (!record) return null;

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase();
  };

  const isPDF = getFileExtension(record.submitted_file) === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(getFileExtension(record.submitted_file) || '');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Record Details</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>{record.form_document.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Submitted by {record.submitted_by.full_name} on {new Date(record.created_at).toLocaleString()}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>Submitted File</Typography>
          
          {/* PDF Preview */}
          {isPDF && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Preview (PDF):
              </Typography>
              <Box
                component="iframe"
                src={record.submitted_file}
                sx={{
                  width: '100%',
                  height: 400,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
                title="PDF Preview"
              />
            </Box>
          )}

          {/* Image Preview */}
          {isImage && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Preview (Image):
              </Typography>
              <Box
                component="img"
                src={record.submitted_file}
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
                alt="Form Preview"
              />
            </Box>
          )}

          {/* Download Link */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link href={record.submitted_file} target="_blank" rel="noopener noreferrer">
              Download and view the submitted form
            </Link>
            <Typography variant="caption" color="text.secondary">
              ({getFileExtension(record.submitted_file)?.toUpperCase()} file)
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialog for confirming rejection
const RejectRecordDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  submitting: boolean;
}> = ({ open, onClose, onConfirm, submitting }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reject Record</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Please provide a reason for rejecting this record. This will be sent back to the submitter.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Rejection Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={!reason.trim() || submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Records: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/records/');
      setRecords(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);
  
  const handleSubmitSuccess = () => {
    setSnackbar({ open: true, message: 'Record submitted successfully!', severity: 'success' });
    fetchRecords();
  };

  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
  };

  const handleApproveRecord = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to approve this record?')) return;

    setSubmitting(true);
    try {
      await axiosInstance.post(`/records/${recordId}/approve/`);
      setSnackbar({ open: true, message: 'Record approved successfully!', severity: 'success' });
      fetchRecords();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to approve record.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleOpenRejectDialog = (record: Record) => {
    setSelectedRecord(record);
    setOpenRejectDialog(true);
  };
  
  const handleRejectRecord = async (reason: string) => {
    if (!selectedRecord) return;

    setSubmitting(true);
    try {
      await axiosInstance.post(`/records/${selectedRecord.id}/reject/`, { rejection_reason: reason });
      setSnackbar({ open: true, message: 'Record rejected successfully.', severity: 'success' });
      setOpenRejectDialog(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to reject record.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status: Record['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Chip label="Pending Review" color="warning" variant="outlined" size="small" />;
      case 'APPROVED':
        return <Chip label="Approved" color="success" variant="outlined" size="small" />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" variant="outlined" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Form Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenSubmitDialog(true)}
        >
          Submit New Record
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Form Name</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{record.form_document.title}</TableCell>
                    <TableCell>{record.submitted_by.full_name}</TableCell>
                    <TableCell>{formatDate(record.created_at)}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleViewRecord(record)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {user?.position === 'HSSE MANAGER' && record.status === 'PENDING_REVIEW' && (
                        <>
                          <Tooltip title="Approve">
                            <span>
                              <IconButton size="small" color="success" onClick={() => handleApproveRecord(record.id)} disabled={submitting}>
                                <ApproveIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <span>
                              <IconButton size="small" color="error" onClick={() => handleOpenRejectDialog(record)} disabled={submitting}>
                                <RejectIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <SubmitRecordDialog 
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
        onSuccess={handleSubmitSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })}
        message={snackbar.message}
      />

      <RecordDetailsDialog 
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        record={selectedRecord}
      />
      <RejectRecordDialog 
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        onConfirm={handleRejectRecord}
        submitting={submitting}
      />
    </Box>
  );
};

export default Records; 