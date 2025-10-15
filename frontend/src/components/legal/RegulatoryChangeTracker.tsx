import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Collapse,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  Warning as WarningIcon,
  AttachFile as AttachFileIcon,
  OpenInNew as OpenInNewIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface LegislationTracker {
  id: number;
  permit: string;
  issuing_authority: string;
  license_number: string;
  unit: string;
  date_of_issue: string;
  expiring_date: string;
  days_left: number;
  status: 'valid' | 'expired';
  action_taken: string;
  evidence?: string;
  evidence_url?: string;
}

const STATUS_CHOICES = [
  { value: '', label: 'All Status' },
  { value: 'valid', label: 'Valid' },
  { value: 'expired', label: 'Expired' },
];

const TrackerCard: React.FC<{
  tracker: LegislationTracker;
  onEdit: (tracker: LegislationTracker) => void;
  onDelete: (tracker: LegislationTracker) => void;
  isHSSEManager: boolean;
}> = ({ tracker, onEdit, onDelete, isHSSEManager }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const getStatusColor = (status: string) => {
    return status === 'valid' ? theme.palette.success.main : theme.palette.error.main;
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 30) return theme.palette.error.main;
    if (days <= 90) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getDaysLeftBgColor = (days: number) => {
    if (days <= 30) return alpha(theme.palette.error.main, 0.1);
    if (days <= 90) return alpha(theme.palette.warning.main, 0.1);
    return alpha(theme.palette.success.main, 0.1);
  };

  const getUrgencyLevel = (days: number) => {
    if (days <= 0) return 'EXPIRED';
    if (days <= 30) return 'CRITICAL';
    if (days <= 90) return 'WARNING';
    return 'GOOD';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(tracker);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(tracker);
  };

  const urgencyLevel = getUrgencyLevel(tracker.days_left);

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${alpha(getDaysLeftColor(tracker.days_left), 0.2)}`,
        borderLeft: `4px solid ${getDaysLeftColor(tracker.days_left)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AssignmentIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {tracker.permit}
              </Typography>
              <Chip
                label={tracker.status.toUpperCase()}
                size="small"
                icon={tracker.status === 'valid' ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{
                  backgroundColor: alpha(getStatusColor(tracker.status), 0.1),
                  color: getStatusColor(tracker.status),
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              License: {tracker.license_number}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {tracker.issuing_authority}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Expires: {new Date(tracker.expiring_date).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Chip
                label={`${tracker.days_left} days left`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: getDaysLeftBgColor(tracker.days_left),
                  color: getDaysLeftColor(tracker.days_left),
                  border: `1px solid ${alpha(getDaysLeftColor(tracker.days_left), 0.3)}`,
                }}
              />
              
              {urgencyLevel !== 'GOOD' && (
                <Chip
                  label={urgencyLevel}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: urgencyLevel === 'CRITICAL' 
                      ? alpha(theme.palette.error.main, 0.15)
                      : alpha(theme.palette.warning.main, 0.15),
                    color: urgencyLevel === 'CRITICAL' 
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            
            {isHSSEManager && (
              <>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Unit/Department
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {tracker.unit}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Date of Issue
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {new Date(tracker.date_of_issue).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Action Taken
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {tracker.action_taken || 'No action recorded'}
              </Typography>
            </Grid>
            
            {tracker.evidence_url && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  <AttachFileIcon sx={{ color: theme.palette.info.main }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                      Evidence Document
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      Supporting Documentation Available
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<OpenInNewIcon />}
                    href={tracker.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    View PDF
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const RegulatoryChangeTracker: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isHSSEManager = user?.position === 'HSSE MANAGER';
  
  const [trackers, setTrackers] = useState<LegislationTracker[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedTracker, setSelectedTracker] = useState<LegislationTracker | null>(null);

  useEffect(() => {
    fetchTrackers();
  }, [search, statusFilter]);

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await axiosInstance.get('/legals/legislation-trackers/', { params });
      setTrackers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching trackers:', error);
      setSnackbar({ open: true, message: 'Failed to fetch trackers' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tracker: LegislationTracker) => {
    setSelectedTracker(tracker);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleDelete = async (tracker: LegislationTracker) => {
    if (!window.confirm(`Are you sure you want to delete permit "${tracker.permit}"?`)) return;
    
    try {
      await axiosInstance.delete(`/legals/legislation-trackers/${tracker.id}/`);
      setSnackbar({ open: true, message: 'Tracker deleted successfully' });
      fetchTrackers();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete tracker' });
    }
  };

  const handleCreateNew = () => {
    setSelectedTracker(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await axiosInstance.post('/legals/legislation-trackers/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({ open: true, message: 'Tracker created successfully!' });
      } else {
        await axiosInstance.put(`/legals/legislation-trackers/${selectedTracker?.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({ open: true, message: 'Tracker updated successfully!' });
      }
      
      setFormModalOpen(false);
      fetchTrackers();
    } catch (error: any) {
      console.error('Error saving tracker:', error);
      const errorMessage = error.response?.data?.detail || 
                          JSON.stringify(error.response?.data) ||
                          `Failed to ${formMode} tracker`;
      setSnackbar({ open: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const filteredTrackers = trackers;

  // Group trackers by urgency
  const criticalTrackers = filteredTrackers.filter(t => t.days_left <= 30);
  const warningTrackers = filteredTrackers.filter(t => t.days_left > 30 && t.days_left <= 90);
  const goodTrackers = filteredTrackers.filter(t => t.days_left > 90);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Regulatory Change Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor permits, licenses, and regulatory compliance deadlines
        </Typography>
      </Box>

      {/* Alert Summary */}
      {criticalTrackers.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          icon={<WarningIcon />}
        >
          <Typography variant="body2" fontWeight={600}>
            {criticalTrackers.length} permit{criticalTrackers.length !== 1 ? 's' : ''} expiring within 30 days - immediate action required!
          </Typography>
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Search
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search permits, licenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                  >
                    {STATUS_CHOICES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            {isHSSEManager && (
              <Grid item xs={12} md={3}>
                <Box sx={{ pt: 2.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                    sx={{ height: 40 }}
                  >
                    Add Tracker
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                {criticalTrackers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical (≤30 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                {warningTrackers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Warning (30-90 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                {goodTrackers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Good (&gt;90 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTrackers.length} tracker{filteredTrackers.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Trackers List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      ) : filteredTrackers.length === 0 ? (
        <Alert severity="info">No trackers found. Add your first permit/license tracker to get started.</Alert>
      ) : (
        filteredTrackers.map((tracker) => (
          <TrackerCard
            key={tracker.id}
            tracker={tracker}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isHSSEManager={isHSSEManager}
          />
        ))
      )}

      {/* Form Modal */}
      <TrackerFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedTracker(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedTracker}
        mode={formMode}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
};

// Form Modal Component
const TrackerFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData: LegislationTracker | null;
  mode: 'create' | 'edit';
}> = ({ open, onClose, onSubmit, initialData, mode }) => {
  const theme = useTheme();
  const [form, setForm] = useState<Partial<LegislationTracker>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        status: 'valid',
      });
    }
    setSelectedFile(null);
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add all form fields
    Object.keys(form).forEach(key => {
      const value = form[key as keyof LegislationTracker];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add file if selected
    if (selectedFile) {
      formData.append('evidence', selectedFile);
    }

    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 700,
        }}
      >
        {mode === 'create' ? 'Add Permit/License Tracker' : 'Edit Tracker'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Permit/License Name"
                name="permit"
                value={form.permit || ''}
                onChange={handleChange}
                required
                placeholder="e.g., Environmental Operating Permit"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                name="license_number"
                value={form.license_number || ''}
                onChange={handleChange}
                required
                placeholder="e.g., EPA/2024/001"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Issuing Authority"
                name="issuing_authority"
                value={form.issuing_authority || ''}
                onChange={handleChange}
                required
                placeholder="e.g., Environmental Protection Agency"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Unit/Department"
                name="unit"
                value={form.unit || ''}
                onChange={handleChange}
                required
                placeholder="e.g., Operations Department"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Issue"
                type="date"
                name="date_of_issue"
                value={form.date_of_issue || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                name="expiring_date"
                value={form.expiring_date || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Status *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="status"
                    value={form.status || 'valid'}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="valid">Valid</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Action Taken"
                name="action_taken"
                value={form.action_taken || ''}
                onChange={handleChange}
                multiline
                rows={3}
                required
                placeholder="Actions taken to obtain/renew this permit/license"
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
                onClick={() => document.getElementById('evidence-upload')?.click()}
              >
                <input
                  id="evidence-upload"
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {selectedFile ? selectedFile.name : 'Upload Evidence (Optional)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PDF document (Max 10MB)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {mode === 'create' ? 'Create Tracker' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegulatoryChangeTracker;

