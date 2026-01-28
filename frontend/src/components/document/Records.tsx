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
  InputAdornment,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Breadcrumbs,
  alpha,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  UploadFile as UploadFileIcon,
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Lock as LockIcon,
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
  form_document?: Document;
  source_document?: Document;
  form_document_id?: string;
  source_document_id?: string;
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
  // ISO 45001: Classification
  record_classification?: 'LEGAL' | 'OPERATIONAL' | 'AUDIT' | 'INCIDENT' | 'TRAINING' | 'INSPECTION' | 'MAINTENANCE' | 'HEALTH';
  // ISO 45001: Retention
  retention_period_years?: number;
  disposal_date?: string;
  days_until_disposal?: number;
  // ISO 45001: Location
  storage_location?: string;
  storage_type?: 'ELECTRONIC' | 'PHYSICAL' | 'HYBRID';
  // Context
  department?: string;
  facility_location?: string;
  // ISO 45001: Immutability
  is_locked?: boolean;
  locked_at?: string;
  locked_by?: User;
  // Correction tracking
  correction_version?: number;
  parent_record?: {
    id: string;
    record_number: string;
    title: string;
  };
  // Access restrictions
  access_restrictions?: Record<string, any>;
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
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceDocumentId, setSourceDocumentId] = useState<string>('');
  const [recordClassification, setRecordClassification] = useState<string>('OPERATIONAL');
  const [department, setDepartment] = useState<string>(user?.department || '');
  const [facilityLocation, setFacilityLocation] = useState<string>('');
  const [storageLocation, setStorageLocation] = useState<string>('');
  const [storageType, setStorageType] = useState<string>('ELECTRONIC');
  const [retentionPeriodYears, setRetentionPeriodYears] = useState<number>(7);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableForms, setAvailableForms] = useState<Document[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch approved forms when dialog opens
  useEffect(() => {
    if (open) {
      fetchApprovedForms();
    } else {
      // Reset form when closed
      setSelectedFile(null);
      setTitle('');
      setNotes('');
      setSourceDocumentId('');
      setRecordClassification('OPERATIONAL');
      setDepartment(user?.department || '');
      setFacilityLocation('');
      setStorageLocation('');
      setStorageType('ELECTRONIC');
      setRetentionPeriodYears(7);
      setSelectedYear(new Date().getFullYear());
      setError(null);
    }
  }, [open, user]);

  const fetchApprovedForms = async () => {
    try {
      setLoadingForms(true);
      const response = await axiosInstance.get('/documents/', {
        params: {
          document_type: 'FORM',
          status: 'APPROVED',
        }
      });
      setAvailableForms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching approved forms:', err);
      setAvailableForms([]);
    } finally {
      setLoadingForms(false);
    }
  };
  
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
    
    // ISO 45001 fields
    if (sourceDocumentId) {
      formData.append('source_document_id', sourceDocumentId);
    }
    formData.append('record_classification', recordClassification);
    if (department) formData.append('department', department);
    if (facilityLocation.trim()) formData.append('facility_location', facilityLocation.trim());
    if (storageLocation.trim()) formData.append('storage_location', storageLocation.trim());
    formData.append('storage_type', storageType);
    formData.append('retention_period_years', retentionPeriodYears.toString());
    // Allow user to specify year (will be validated/overridden by backend if needed)
    formData.append('year', selectedYear.toString());
    
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
          <Stack spacing={2}>
            {/* Form Selection */}
            <FormControl fullWidth>
              <InputLabel>Form Template (Optional)</InputLabel>
              <Select
                value={sourceDocumentId}
                label="Form Template (Optional)"
                onChange={(e) => setSourceDocumentId(e.target.value)}
                disabled={loadingForms}
              >
                <MenuItem value="">
                  <em>None - General Record</em>
                </MenuItem>
                {availableForms.map((form) => (
                  <MenuItem key={form.id} value={form.id}>
                    {form.title} (v{form.version})
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Select the approved form this record is based on (if applicable)
              </Typography>
            </FormControl>

            {/* Record Title */}
            <TextField
              fullWidth
              label="Record Title"
              placeholder="e.g., Monthly Safety Inspection - November 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              helperText="Give this record a descriptive name"
            />

            {/* Record Classification */}
            <FormControl fullWidth>
              <InputLabel>Record Classification *</InputLabel>
              <Select
                value={recordClassification}
                label="Record Classification *"
                onChange={(e) => setRecordClassification(e.target.value)}
              >
                <MenuItem value="LEGAL">Legal Requirement</MenuItem>
                <MenuItem value="OPERATIONAL">Operational Record</MenuItem>
                <MenuItem value="AUDIT">Audit Evidence</MenuItem>
                <MenuItem value="INCIDENT">Incident Record</MenuItem>
                <MenuItem value="TRAINING">Training Record</MenuItem>
                <MenuItem value="INSPECTION">Inspection Record</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance Record</MenuItem>
                <MenuItem value="HEALTH">Health Surveillance Record</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                ISO 45001: Classification determines retention requirements
              </Typography>
            </FormControl>

            {/* Department and Facility */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={department}
                    label="Department"
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <MenuItem value="HSSE">HSSE</MenuItem>
                    <MenuItem value="OPERATIONS">Operations</MenuItem>
                    <MenuItem value="FINANCE">Finance</MenuItem>
                    <MenuItem value="MARKETING">Marketing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facility Location"
                  placeholder="e.g., Main Office, Warehouse A"
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Storage Information */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Storage Type</InputLabel>
                  <Select
                    value={storageType}
                    label="Storage Type"
                    onChange={(e) => setStorageType(e.target.value)}
                  >
                    <MenuItem value="ELECTRONIC">Electronic</MenuItem>
                    <MenuItem value="PHYSICAL">Physical</MenuItem>
                    <MenuItem value="HYBRID">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Storage Location"
                  placeholder="e.g., Server: /records/2025/, Cabinet: A-12"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Year Selection */}
            <FormControl fullWidth>
              <InputLabel>Record Year *</InputLabel>
              <Select
                value={selectedYear}
                label="Record Year *"
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Select the year this record belongs to (defaults to current year)
              </Typography>
            </FormControl>

            {/* Retention Period */}
            <TextField
              fullWidth
              type="number"
              label="Retention Period (Years)"
              value={retentionPeriodYears}
              onChange={(e) => setRetentionPeriodYears(parseInt(e.target.value) || 7)}
              inputProps={{ min: 1, max: 100 }}
              helperText={`Record will be retained for ${retentionPeriodYears} year(s). Disposal date will be calculated automatically.`}
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
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={submitting}
          size="small"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!title.trim() || !selectedFile || submitting}
          size="small"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
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
            {(record.source_document || record.form_document) && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Source Form</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {(record.source_document || record.form_document)?.title || 'N/A'}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Record Classification</Typography>
              <Chip 
                label={record.record_classification?.replace('_', ' ') || 'Operational'} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </Grid>
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
            {record.department && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Department</Typography>
                <Typography variant="body1">{record.department}</Typography>
              </Grid>
            )}
            {record.facility_location && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Facility Location</Typography>
                <Typography variant="body1">{record.facility_location}</Typography>
              </Grid>
            )}
            {/* ISO 45001: Retention Information */}
            {(record.retention_period_years || record.disposal_date) && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Retention Period</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {record.retention_period_years || 7} year(s)
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Disposal Date</Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: record.days_until_disposal !== undefined && record.days_until_disposal < 90 
                        ? theme.palette.warning.main 
                        : 'inherit'
                    }}
                  >
                    {record.disposal_date 
                      ? new Date(record.disposal_date).toLocaleDateString()
                      : 'Not calculated'}
                    {record.days_until_disposal !== undefined && record.days_until_disposal < 90 && (
                      <Chip 
                        label={`${record.days_until_disposal} days remaining`} 
                        size="small" 
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                </Grid>
              </>
            )}
            {/* ISO 45001: Storage Information */}
            {(record.storage_location || record.storage_type) && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Storage Type</Typography>
                  <Chip 
                    label={record.storage_type || 'Electronic'} 
                    size="small" 
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                {record.storage_location && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Storage Location</Typography>
                    <Typography variant="body1">{record.storage_location}</Typography>
                  </Grid>
                )}
              </>
            )}
            {/* ISO 45001: Immutability */}
            {record.is_locked && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    🔒 Record Locked (Immutable)
                  </Typography>
                  <Typography variant="caption">
                    This record has been locked and cannot be modified. 
                    {record.locked_at && ` Locked on ${new Date(record.locked_at).toLocaleString()}`}
                    {record.locked_by && ` by ${record.locked_by.full_name}`}
                  </Typography>
                </Alert>
              </Grid>
            )}
            {/* Correction Tracking */}
            {record.parent_record && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<InfoIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Correction Record
                  </Typography>
                  <Typography variant="caption">
                    This is a correction of record {record.parent_record.record_number}. 
                    Version: {record.correction_version || 1}
                  </Typography>
                </Alert>
              </Grid>
            )}
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
        <Button 
          onClick={onClose}
          size="small"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
        >
          Close
        </Button>
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
        <Button 
          onClick={handleClose} 
          disabled={submitting}
          size="small"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error" 
          disabled={!reason.trim() || submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <RejectIcon />}
          size="small"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
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
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
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
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      const response = await axiosInstance.get('/records/', { params });
      setRecords(response.data);
      setError(null);
      setPage(0); // Reset to first page when filters change
    } catch (err: any) {
      setError('Failed to fetch records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of years and overall statistics
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchYears();
      await fetchStatistics(); // Fetch overall statistics (no year parameter)
      setLoading(false);
    };
    loadInitialData();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedYear !== null) {
        fetchRecords(selectedYear);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    // Fetch overall statistics when going back to year folders view
    fetchStatistics();
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
  
  // Filter records based on search
  const filteredRecords = React.useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase();
    return records.filter(record =>
      record.title?.toLowerCase().includes(query) ||
      record.record_number?.toLowerCase().includes(query) ||
      record.submitted_by?.full_name?.toLowerCase().includes(query) ||
      record.notes?.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  // Paginated records
  const paginatedRecords = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, page, rowsPerPage]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Compact Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: selectedYear !== null ? 1.5 : 2,
        flexWrap: 'wrap', 
        gap: 1.5 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedYear !== null && (
            <IconButton
              onClick={handleBackToYears}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedYear === null ? 'Form Records' : `${selectedYear} Records`}
            </Typography>
            {selectedYear !== null && (
              <Chip
                label={selectedYear === new Date().getFullYear() ? 'Current Year' : 'Past Year'}
                size="small"
                color={selectedYear === new Date().getFullYear() ? 'primary' : 'default'}
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenSubmitDialog(true)}
          size="small"
          sx={{ fontSize: '0.8rem', py: 0.5 }}
        >
          Submit New Record
        </Button>
      </Box>

      {/* Search Bar and Status Filter - Side by Side */}
      {selectedYear !== null && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 1,
          flexWrap: 'wrap'
        }}>
          <TextField
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ 
              flex: 1,
              minWidth: 250,
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.default,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING_REVIEW">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          {searchQuery && (
            <Chip 
              label={`${filteredRecords.length} result${filteredRecords.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {/* Content: Year Folders or Records Table */}
      {selectedYear === null ? (
        // Year Folders View - Simplified
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : years.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <FolderIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Records Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Submit your first completed form to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenSubmitDialog(true)}
              size="small"
            >
              Submit New Record
            </Button>
          </Paper>
        ) : (
          <>
            {/* Year Dropdown - Simple Selection */}
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="medium">
                <InputLabel>Select Year</InputLabel>
                <Select
                  value=""
                  label="Select Year"
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year) {
                      handleYearClick(year);
                    }
                  }}
                  sx={{
                    bgcolor: 'background.paper',
                  }}
                >
                  {years
                    .sort((a, b) => b.year - a.year) // Sort newest first
                    .map((yearData) => {
                      const currentYear = new Date().getFullYear();
                      const isCurrentYear = yearData.year === currentYear;
                      
                      return (
                        <MenuItem key={yearData.year} value={yearData.year}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: isCurrentYear ? 600 : 400 }}>
                                {yearData.year}
                              </Typography>
                              {isCurrentYear && (
                                <Chip
                                  label="Current"
                                  size="small"
                                  color="primary"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {yearData.total} record{yearData.total !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Box>

            {/* Dashboard Statistics Cards - Uniform Design */}
            {stats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 2.5,
                      height: '100%',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 48,
                          height: 48,
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                          Total Records
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, lineHeight: 1.2 }}>
                          {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          Across all years
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 2.5,
                      height: '100%',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: theme.palette.warning.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 48,
                          height: 48,
                        }}
                      >
                        <FilterIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                          Pending Review
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main, lineHeight: 1.2 }}>
                          {stats.pending}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          {stats.total > 0 ? `${Math.round((stats.pending / stats.total) * 100)}% of total` : '0%'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 2.5,
                      height: '100%',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: theme.palette.success.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 48,
                          height: 48,
                        }}
                      >
                        <ApproveIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                          Approved
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main, lineHeight: 1.2 }}>
                          {stats.approved}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% of total` : '0%'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      bgcolor: theme.palette.grey[100],
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 2.5,
                      height: '100%',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: theme.palette.error.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 48,
                          height: 48,
                        }}
                      >
                        <RejectIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                          Rejected
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main, lineHeight: 1.2 }}>
                          {stats.rejected}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          {stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}% of total` : '0%'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )
      ) : (
        // Records List View (inside a year folder)
        <>
          {/* Records Table */}
      <Paper sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}`, mt: 0.5 }}>
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Classification</Typography>
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
                  <TableCell colSpan={user?.position === 'HSSE MANAGER' ? 8 : 7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.position === 'HSSE MANAGER' ? 8 : 7} align="center" sx={{ py: 8 }}>
                    {searchQuery ? (
                      <>
                        <SearchIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Records Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No records match "{searchQuery}". Try a different search term.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          onClick={() => setSearchQuery('')}
                          size="small"
                          sx={{ fontSize: '0.8rem', py: 0.5 }}
                        >
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <DescriptionIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Records Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          No records found for {selectedYear}. Submit your first record to get started!
                        </Typography>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {record.record_number ? (
                          <Chip 
                            label={record.record_number} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Generating...
                          </Typography>
                        )}
                        {record.is_locked && (
                          <Tooltip title="Record is locked and immutable">
                            <LockIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {record.title || (record.source_document?.title || record.form_document?.title || 'Untitled Record')}
                      </Typography>
                      {record.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {record.notes.substring(0, 60)}{record.notes.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.record_classification?.replace('_', ' ') || 'Operational'} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      {record.disposal_date && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Dispose: {new Date(record.disposal_date).toLocaleDateString()}
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
        {filteredRecords.length > 0 && (
          <TablePagination
            component="div"
            count={filteredRecords.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Records per page:"
          />
        )}
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