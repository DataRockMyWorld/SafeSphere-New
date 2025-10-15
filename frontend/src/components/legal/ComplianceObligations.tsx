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
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface ComplianceObligation {
  id: number;
  title: string;
  regulatory_requirement: string;
  legal_obligation: string;
  owner_department: string;
  compliance_status: 'compliant' | 'non-compliant' | 'partial';
  assigned_to: any[];
  assigned_to_ids?: number[];
  country: string;
  category: string;
  last_updated: string;
  further_actions: string;
  evaluation_compliance: string;
  last_review_date?: string;
  next_review_date?: string;
  review_period_days?: number;
  review_notes?: string;
}

const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HSSE', label: 'HSSE' },
  { value: 'FINANCE', label: 'Finance' },
];

const COMPLIANCE_STATUS = [
  { value: '', label: 'All Status' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'partial', label: 'Partial' },
];

const ObligationCard: React.FC<{
  obligation: ComplianceObligation;
  onEdit: (obligation: ComplianceObligation) => void;
  onDelete: (obligation: ComplianceObligation) => void;
}> = ({ obligation, onEdit, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return theme.palette.success.main;
      case 'non-compliant':
        return theme.palette.error.main;
      case 'partial':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon sx={{ fontSize: 20 }} />;
      case 'non-compliant':
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case 'partial':
        return <WarningIcon sx={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(obligation);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(obligation);
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${alpha(getStatusColor(obligation.compliance_status), 0.2)}`,
        borderLeft: `4px solid ${getStatusColor(obligation.compliance_status)}`,
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
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {obligation.title}
              </Typography>
              <Chip
                icon={getStatusIcon(obligation.compliance_status)}
                label={obligation.compliance_status.replace('-', ' ').toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: alpha(getStatusColor(obligation.compliance_status), 0.1),
                  color: getStatusColor(obligation.compliance_status),
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {obligation.owner_department}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Updated: {new Date(obligation.last_updated).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Chip
                label={obligation.country}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
              
              <Chip
                label={obligation.category}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                }}
              />
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
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Regulatory Requirement
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {obligation.regulatory_requirement}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Legal Obligation
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {obligation.legal_obligation || 'Not provided'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Compliance Evaluation
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {obligation.evaluation_compliance || 'Not provided'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Further Actions Required
              </Typography>
              <Typography variant="body2">
                {obligation.further_actions || 'No actions required'}
              </Typography>
            </Grid>
            
            {obligation.assigned_to && obligation.assigned_to.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                  Assigned To
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {obligation.assigned_to.map((person: any, index: number) => (
                    <Chip
                      key={index}
                      icon={<PersonIcon />}
                      label={person.name || 'Unknown'}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const ComplianceObligations: React.FC = () => {
  const theme = useTheme();
  const [obligations, setObligations] = useState<ComplianceObligation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedObligation, setSelectedObligation] = useState<ComplianceObligation | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [laws, setLaws] = useState<any[]>([]);

  useEffect(() => {
    fetchObligations();
    fetchFormData();
  }, [search, departmentFilter, statusFilter]);

  const fetchFormData = async () => {
    try {
      const [categoriesRes, positionsRes, lawsRes] = await Promise.all([
        axiosInstance.get('/legals/categories/'),
        axiosInstance.get('/legals/positions/'),
        axiosInstance.get('/legals/resources/'),
      ]);
      setCategories(categoriesRes.data);
      setPositions(positionsRes.data.results || positionsRes.data);
      setLaws(lawsRes.data.results || lawsRes.data);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchObligations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (departmentFilter) params.owner_department = departmentFilter;
      if (statusFilter) params.compliance_status = statusFilter;

      const response = await axiosInstance.get('/legals/register-entries/', { params });
      setObligations(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching obligations:', error);
      setSnackbar({ open: true, message: 'Failed to fetch obligations' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedObligation(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleEdit = (obligation: ComplianceObligation) => {
    setSelectedObligation(obligation);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleDelete = async (obligation: ComplianceObligation) => {
    if (!window.confirm(`Are you sure you want to delete "${obligation.title}"?`)) return;
    
    try {
      await axiosInstance.delete(`/legals/register-entries/${obligation.id}/`);
      setSnackbar({ open: true, message: 'Obligation deleted successfully' });
      fetchObligations();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete obligation' });
    }
  };

  const handleFormSubmit = async (data: Partial<ComplianceObligation>) => {
    try {
      setLoading(true);
      
      // Ensure assigned_to_ids is always an array (empty if not selected)
      const payload = {
        ...data,
        assigned_to_ids: data.assigned_to_ids || [],
      };
      
      console.log('Submitting data:', payload); // Debug log
      
      if (formMode === 'create') {
        await axiosInstance.post('/legals/register-entries/', payload);
        setSnackbar({ open: true, message: 'Obligation created successfully!' });
      } else {
        await axiosInstance.put(`/legals/register-entries/${selectedObligation?.id}/`, payload);
        setSnackbar({ open: true, message: 'Obligation updated successfully!' });
      }
      setFormModalOpen(false);
      fetchObligations();
    } catch (error: any) {
      console.error('Error creating/updating obligation:', error.response?.data || error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          JSON.stringify(error.response?.data) ||
                          `Failed to ${formMode} obligation`;
      setSnackbar({ open: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const filteredObligations = obligations;

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Compliance Obligations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage all HSSE compliance requirements and regulatory obligations
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Search
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search obligations..."
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
            
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Department
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    displayEmpty
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
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
                    {COMPLIANCE_STATUS.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ pt: 2.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                  sx={{ height: 40 }}
                >
                  Add New
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredObligations.length} obligation{filteredObligations.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Obligations List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      ) : filteredObligations.length === 0 ? (
        <Alert severity="info">No compliance obligations found. Add your first obligation to get started.</Alert>
      ) : (
        filteredObligations.map((obligation) => (
          <ObligationCard
            key={obligation.id}
            obligation={obligation}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Form Modal */}
      <ObligationFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedObligation}
        mode={formMode}
        categories={categories}
        positions={positions}
        laws={laws}
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
const ObligationFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ComplianceObligation>) => void;
  initialData: ComplianceObligation | null;
  mode: 'create' | 'edit';
  categories: any[];
  positions: any[];
  laws: any[];
}> = ({ open, onClose, onSubmit, initialData, mode, categories, positions, laws }) => {
  const theme = useTheme();
  const [form, setForm] = useState<Partial<ComplianceObligation>>({});

  useEffect(() => {
    if (initialData) {
      // When editing, extract IDs from assigned_to array
      const assigned_to_ids = initialData.assigned_to?.map((person: any) => person.id) || [];
      setForm({ ...initialData, assigned_to_ids });
    } else {
      // When creating, initialize with empty array
      setForm({ assigned_to_ids: [] });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const COUNTRIES = [
    { value: 'GH', label: 'Ghana' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'KE', label: 'Kenya' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
  ];

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
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        fontWeight: 700,
        fontSize: '1.25rem',
      }}>
        {mode === 'create' ? 'Create New Compliance Obligation' : 'Edit Compliance Obligation'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={form.title || ''}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Regulatory Requirement"
                name="regulatory_requirement"
                value={form.regulatory_requirement || ''}
                onChange={handleChange}
                multiline
                rows={3}
                required
                placeholder="e.g., 'Section 12.3 requires monthly fire extinguisher inspections'"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Legal Obligation"
                name="legal_obligation"
                value={form.legal_obligation || ''}
                onChange={handleChange}
                multiline
                rows={2}
                required
                placeholder="e.g., 'Conduct monthly inspections and maintain records for 5 years'"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Owner Department *
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    name="owner_department"
                    value={form.owner_department || ''}
                    onChange={(e) => handleSelectChange('owner_department', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select department</MenuItem>
                    {DEPARTMENTS.filter(d => d.value).map(dept => (
                      <MenuItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Compliance Status *
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    name="compliance_status"
                    value={form.compliance_status || ''}
                    onChange={(e) => handleSelectChange('compliance_status', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select status</MenuItem>
                    {COMPLIANCE_STATUS.filter(s => s.value !== '').map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Country *
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    name="country"
                    value={form.country || ''}
                    onChange={(e) => handleSelectChange('country', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select country</MenuItem>
                    {COUNTRIES.map(country => (
                      <MenuItem key={country.value} value={country.value}>
                        {country.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Category *
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    name="category"
                    value={form.category || ''}
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select category</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Compliance Evaluation"
                name="evaluation_compliance"
                value={form.evaluation_compliance || ''}
                onChange={handleChange}
                multiline
                rows={2}
                required
                placeholder="e.g., 'Monthly inspection logs reviewed, 100% completion rate maintained'"
              />
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Assigned To (Optional)
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="assigned_to_ids"
                    multiple
                    value={form.assigned_to_ids || []}
                    onChange={(e) => handleSelectChange('assigned_to_ids', e.target.value)}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected || (selected as number[]).length === 0) {
                        return <em style={{ color: theme.palette.text.secondary }}>Select positions to assign</em>;
                      }
                      const selectedPositions = positions.filter(p => (selected as number[]).includes(p.id));
                      return selectedPositions.map(p => p.name).join(', ');
                    }}
                  >
                    {positions.length === 0 ? (
                      <MenuItem disabled>
                        <em>No positions available</em>
                      </MenuItem>
                    ) : (
                      positions.map(position => (
                        <MenuItem key={position.id} value={position.id}>
                          <Checkbox checked={(form.assigned_to_ids || []).includes(position.id)} />
                          <ListItemText primary={position.name} />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Further Actions Required"
                name="further_actions"
                value={form.further_actions || ''}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="What actions are needed to achieve/maintain compliance?"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: theme.palette.primary.main }}>
                Review Cycle Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next Review Date"
                type="date"
                name="next_review_date"
                value={form.next_review_date || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="When should this obligation be reviewed next? (Default: 1 year from today)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Review Period (Days)"
                type="number"
                name="review_period_days"
                value={form.review_period_days || 365}
                onChange={handleChange}
                helperText="How often should this be reviewed? (Default: 365 days = yearly)"
              />
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
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComplianceObligations;

