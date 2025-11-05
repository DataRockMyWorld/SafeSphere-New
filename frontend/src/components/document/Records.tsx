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
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
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
  record_number: string;
  title: string;
  notes: string;
  form_document: Document;
  submitted_by: User;
  submitted_file: string;
  submitted_file_url: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  created_at: string;
  year: number;
  reviewed_by?: User;
  reviewed_at?: string;
  rejection_reason?: string;
  notification_sent: boolean;
  email_sent: boolean;
}

interface YearData {
  year: number;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface RecordStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  by_year: Array<{ year: number; count: number }>;
}

// Dialog for submitting a new record
const SubmitRecordDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setTitle('');
      setNotes('');
      setError(null);
    }
  }, [open]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-populate title from filename if empty
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !title.trim()) {
      setError('Please provide a title and select a file.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('submitted_file', selectedFile);
    if (notes.trim()) formData.append('notes', notes.trim());
    
    try {
      await axiosInstance.post('/records/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.submitted_file?.[0] || 'Failed to submit record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit New Record</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mt: 2 }}>
          {/* Record Title */}
          <TextField
            fullWidth
            label="Record Title"
            placeholder="e.g., Monthly Safety Inspection - November 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
            helperText="Give this record a descriptive name"
          />

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            placeholder="Add any additional notes or comments..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* File Upload */}
          <Box sx={{ 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'grey.400', 
            borderRadius: 1, 
            textAlign: 'center',
            bgcolor: 'grey.50'
          }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              {selectedFile ? 'Change File' : 'Select File'}
              <input 
                type="file" 
                hidden 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" 
              />
            </Button>
            {selectedFile ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                PDF, Word, Excel, Images (max 10MB)
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!title.trim() || !selectedFile || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
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
  const theme = useTheme();
  
  if (!record) return null;

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase();
  };

  const getStatusColor = (status: Record['status']) => {
    switch (status) {
      case 'APPROVED': return theme.palette.success.main;
      case 'REJECTED': return theme.palette.error.main;
      default: return theme.palette.warning.main;
    }
  };

  const isPDF = getFileExtension(record.submitted_file) === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(getFileExtension(record.submitted_file) || '');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {record.record_number}
          </Typography>
          <Chip 
            label={record.status.replace('_', ' ')} 
            sx={{ 
              bgcolor: `${getStatusColor(record.status)}20`,
              color: getStatusColor(record.status),
              fontWeight: 600
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Record Information */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.grey[50] }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Record Title</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {record.title || 'Untitled Record'}
              </Typography>
            </Grid>
            {record.form_document && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Form Template</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {record.form_document.title}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Submitted By</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {record.submitted_by.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Submission Date</Typography>
              <Typography variant="body1">
                {new Date(record.created_at).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Year</Typography>
              <Typography variant="body1">{record.year}</Typography>
            </Grid>
            {record.notes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Submitter Notes</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {record.notes}
                </Typography>
              </Grid>
            )}
            {record.reviewed_by && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Reviewed By</Typography>
                  <Typography variant="body1">{record.reviewed_by.full_name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Review Date</Typography>
                  <Typography variant="body1">
                    {record.reviewed_at ? new Date(record.reviewed_at).toLocaleString() : '—'}
                  </Typography>
                </Grid>
              </>
            )}
            {record.status === 'REJECTED' && record.rejection_reason && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Rejection Reason:
                  </Typography>
                  <Typography variant="body2">{record.rejection_reason}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Submitted File */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Submitted File
          </Typography>
          
          {/* PDF Preview */}
          {isPDF && (
            <Box sx={{ mb: 2 }}>
              <Box
                component="iframe"
                src={record.submitted_file_url}
                sx={{
                  width: '100%',
                  height: 500,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
                title="PDF Preview"
              />
            </Box>
          )}

          {/* Image Preview */}
          {isImage && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Box
                component="img"
                src={record.submitted_file_url}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 500,
                  objectFit: 'contain',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
                alt="Form Preview"
              />
            </Box>
          )}

          {/* Download Button */}
          <Button
            variant="outlined"
            href={record.submitted_file_url}
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
            sx={{ mt: 2 }}
          >
            Download File ({getFileExtension(record.submitted_file)?.toUpperCase()})
          </Button>
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
      setReason(''); // Reset after submission
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
        Reject Record
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            The submitter will receive an <strong>email and in-app notification</strong> with your rejection reason. Please be clear and constructive.
          </Typography>
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={5}
          label="Rejection Reason (Required)"
          placeholder="Explain what needs to be corrected or why the submission was rejected..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
          required
          helperText={`${reason.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error" 
          disabled={!reason.trim() || submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <RejectIcon />}
        >
          {submitting ? 'Sending...' : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Records: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [years, setYears] = useState<YearData[]>([]);
  const [stats, setStats] = useState<RecordStats | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // null = viewing year folders
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Breadcrumb for navigation
  const [folderPath, setFolderPath] = useState<Array<{ label: string; year: number | null }>>([
    { label: 'Form Records', year: null }
  ]);

  const fetchYears = async () => {
    try {
      const response = await axiosInstance.get('/records/years/');
      const yearData = response.data;
      
      // If no records exist, create a folder for current year
      if (yearData.length === 0) {
        const currentYear = new Date().getFullYear();
        setYears([{
          year: currentYear,
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }]);
      } else {
        setYears(yearData);
      }
    } catch (err: any) {
      console.error('Failed to fetch years:', err);
      // Fallback to current year if API fails
      const currentYear = new Date().getFullYear();
      setYears([{
        year: currentYear,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }]);
    }
  };

  const fetchStatistics = async (year?: number) => {
    try {
      const params = year ? { year } : {};
      const response = await axiosInstance.get('/records/statistics/', { params });
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const fetchRecords = async (year?: number) => {
    if (year === undefined) return; // Only fetch when inside a year folder
    
    try {
      setLoading(true);
      const params: any = { year };
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      
      const response = await axiosInstance.get('/records/', { params });
      setRecords(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of years
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchYears();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  // Fetch records when year or status changes
  useEffect(() => {
    if (selectedYear !== null) {
      fetchRecords(selectedYear);
      fetchStatistics(selectedYear);
    }
  }, [selectedYear, selectedStatus]);
  
  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    setFolderPath([
      { label: 'Form Records', year: null },
      { label: `${year} Records`, year }
    ]);
    setSelectedStatus('ALL');
  };
  
  const handleBackToYears = () => {
    setSelectedYear(null);
    setFolderPath([{ label: 'Form Records', year: null }]);
    setRecords([]);
    setStats(null);
  };
  
  const handleSubmitSuccess = () => {
    const isAutoApproved = user?.position === 'HSSE MANAGER' || user?.is_superuser;
    setSnackbar({ 
      open: true, 
      message: isAutoApproved 
        ? 'Record submitted and auto-approved!' 
        : 'Record submitted successfully! Awaiting HSSE Manager review.', 
      severity: 'success' 
    });
    fetchYears(); // Refresh years list
    if (selectedYear !== null) {
      fetchRecords(selectedYear); // Refresh current year's records
      fetchStatistics(selectedYear);
    }
  };

  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
  };

  const handleApproveRecord = async (recordId: string, recordNumber: string) => {
    if (!window.confirm(`Are you sure you want to approve ${recordNumber}?`)) return;

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(`/records/${recordId}/approve/`);
      setSnackbar({ 
        open: true, 
        message: response.data.message || 'Record approved and submitter notified!', 
        severity: 'success' 
      });
      fetchYears();
      if (selectedYear !== null) {
        fetchRecords(selectedYear);
        fetchStatistics(selectedYear);
      }
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
      const response = await axiosInstance.post(`/records/${selectedRecord.id}/reject/`, { rejection_reason: reason });
      setSnackbar({ 
        open: true, 
        message: response.data.message || 'Record rejected and submitter notified.', 
        severity: 'info' 
      });
      setOpenRejectDialog(false);
      setSelectedRecord(null);
      fetchYears();
      if (selectedYear !== null) {
        fetchRecords(selectedYear);
        fetchStatistics(selectedYear);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to reject record.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status: Record['status']) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'PENDING_REVIEW':
          return { label: 'Pending', bgcolor: '#FFF8E1', color: '#F57C00' };
        case 'APPROVED':
          return { label: 'Approved', bgcolor: '#E8F5E9', color: '#2E7D32' };
        case 'REJECTED':
          return { label: 'Rejected', bgcolor: '#FFEBEE', color: '#C62828' };
        default:
          return { label: status, bgcolor: 'grey.100', color: 'text.secondary' };
      }
    };
    
    const style = getStatusStyle();
    return (
      <Chip 
        label={style.label} 
        size="small" 
        sx={{ 
          bgcolor: style.bgcolor, 
          color: style.color,
          fontWeight: 500,
          border: 'none'
        }} 
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Form Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedYear === null 
                ? 'Browse records by year' 
                : `Viewing ${selectedYear} records`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenSubmitDialog(true)}
            size="large"
          >
            Submit New Record
          </Button>
        </Box>

        {/* Breadcrumb Navigation */}
        {selectedYear !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToYears}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <Typography variant="body2" color="text.secondary">All Years</Typography>
            </Link>
            <Typography color="text.secondary">/</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedYear}
            </Typography>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Content: Year Folders or Records Table */}
      {selectedYear === null ? (
        // Year Folders View
        <Paper sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Year</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Total Records</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pending</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Approved</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Rejected</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  years.map((yearData) => (
                    <TableRow 
                      key={yearData.year}
                      hover
                      onClick={() => handleYearClick(yearData.year)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <FolderIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {yearData.year}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {yearData.total}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: yearData.pending > 0 ? '#F57C00' : 'text.secondary' }}>
                          {yearData.pending}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: yearData.approved > 0 ? '#2E7D32' : 'text.secondary' }}>
                          {yearData.approved}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: yearData.rejected > 0 ? '#C62828' : 'text.secondary' }}>
                          {yearData.rejected}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        // Records List View (inside a year folder)
        <>
          {/* Statistics for selected year */}
          {stats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Records
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Pending Review
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pending}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.approved}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Rejected
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.rejected}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Status Filter (only when inside year folder) */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Filter by Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="PENDING_REVIEW">Pending Review</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  onClick={handleBackToYears}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to All Years
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Chip 
                    label={`Showing ${records.length} record${records.length !== 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Records Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Record #</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Form Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Submitted By</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Status</Typography>
                </TableCell>
                {user?.position === 'HSSE MANAGER' && (
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Reviewed By</Typography>
                  </TableCell>
                )}
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={user?.position === 'HSSE MANAGER' ? 7 : 6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.position === 'HSSE MANAGER' ? 7 : 6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No records found. Submit your first record to get started!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow 
                    key={record.id} 
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                    onClick={() => handleViewRecord(record)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Chip 
                        label={record.record_number} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {record.title || (record.form_document?.title || 'Untitled Record')}
                      </Typography>
                      {record.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {record.notes.substring(0, 60)}{record.notes.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.submitted_by.full_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(record.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    {user?.position === 'HSSE MANAGER' && (
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {record.reviewed_by?.full_name || '—'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleViewRecord(record)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {user?.position === 'HSSE MANAGER' && record.status === 'PENDING_REVIEW' && (
                        <>
                          <Tooltip title="Approve">
                            <span>
                              <IconButton size="small" color="success" onClick={() => handleApproveRecord(record.id, record.record_number)} disabled={submitting}>
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
        </>
      )}
      
      {/* Dialogs */}
      <SubmitRecordDialog 
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
        onSuccess={handleSubmitSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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