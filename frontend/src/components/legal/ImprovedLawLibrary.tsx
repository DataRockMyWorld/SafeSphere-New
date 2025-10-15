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
  InputAdornment,
  Collapse,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface LawResource {
  id: number;
  title: string;
  act_number?: string;
  country: string;
  category: number;
  category_name?: string;
  jurisdiction: string;
  is_repealed: boolean;
  summary: string;
  effective_date?: string;
  enactment_date?: string;
  enforcement_authority?: string;
  authority_contact?: string;
  key_provisions?: string;
  penalties?: string;
  applicability?: string;
  amendment_history?: string;
  official_url?: string;
  related_obligations_count?: number;
}

interface LawCategory {
  id: number;
  name: string;
}

const JURISDICTION_OPTIONS = [
  { value: '', label: 'All Jurisdictions' },
  { value: 'district', label: 'District' },
  { value: 'local', label: 'Local Authority' },
  { value: 'national', label: 'National' },
  { value: 'industrial', label: 'Industrial' },
];

const COUNTRIES = [
  { value: '', label: 'All Countries' },
  { value: 'GH', label: 'Ghana' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
];

const LawCard: React.FC<{
  law: LawResource;
  onView: (law: LawResource) => void;
  onEdit: (law: LawResource) => void;
  onDelete: (law: LawResource) => void;
  isHSSEManager: boolean;
}> = ({ law, onView, onEdit, onDelete, isHSSEManager }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(law);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(law);
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${alpha(law.is_repealed ? theme.palette.error.main : theme.palette.success.main, 0.2)}`,
        borderLeft: `4px solid ${law.is_repealed ? theme.palette.error.main : theme.palette.success.main}`,
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
              <GavelIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {law.title}
              </Typography>
              {law.is_repealed && (
                <Chip
                  icon={<ErrorIcon />}
                  label="REPEALED"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 24,
                  }}
                />
              )}
            </Box>

            {law.act_number && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                {law.act_number}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {law.country}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {law.jurisdiction}
                </Typography>
              </Box>

              {law.effective_date && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Effective: {new Date(law.effective_date).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Chip
                label={law.category_name || 'Unknown Category'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />

              {law.related_obligations_count !== undefined && law.related_obligations_count > 0 && (
                <Chip
                  icon={<AssignmentIcon />}
                  label={`${law.related_obligations_count} obligations`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                  }}
                />
              )}
            </Box>

            {law.summary && !expanded && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {law.summary}
              </Typography>
            )}
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
          
          {law.summary && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Summary
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {law.summary}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            {law.enforcement_authority && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                  Enforcement Authority
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {law.enforcement_authority}
                </Typography>
                {law.authority_contact && (
                  <Typography variant="caption" color="text.secondary">
                    {law.authority_contact}
                  </Typography>
                )}
              </Grid>
            )}

            {law.applicability && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                  Applicability
                </Typography>
                <Typography variant="body2">
                  {law.applicability}
                </Typography>
              </Grid>
            )}

            {law.key_provisions && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                  Key Provisions
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {law.key_provisions}
                </Box>
              </Grid>
            )}

            {law.penalties && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                  Penalties for Non-Compliance
                </Typography>
                <Alert severity="warning" icon={<WarningIcon />} sx={{ fontSize: '0.875rem' }}>
                  {law.penalties}
                </Alert>
              </Grid>
            )}

            {law.amendment_history && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                  Amendment History
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {law.amendment_history}
                </Typography>
              </Grid>
            )}

            {law.official_url && (
              <Grid item xs={12}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  href={law.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  View Official Source
                </Button>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const ImprovedLawLibrary: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isHSSEManager = user?.position === 'HSSE MANAGER';

  const [laws, setLaws] = useState<LawResource[]>([]);
  const [categories, setCategories] = useState<LawCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedLaw, setSelectedLaw] = useState<LawResource | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchLaws();
  }, [search, countryFilter, categoryFilter, jurisdictionFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/legals/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLaws = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (countryFilter) params.country = countryFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (jurisdictionFilter) params.jurisdiction = jurisdictionFilter;
      if (statusFilter) params.is_repealed = statusFilter;

      const response = await axiosInstance.get('/legals/resources/', { params });
      const lawsData = response.data.results || response.data;

      // Enrich with category names and obligation counts
      const enrichedLaws = await Promise.all(
        lawsData.map(async (law: LawResource) => {
          const category = categories.find(c => c.id === law.category);
          
          // Fetch related obligations count
          let obligationsCount = 0;
          try {
            const obligationsResponse = await axiosInstance.get('/legals/register-entries/', {
              params: { legislation_reference: law.id }
            });
            obligationsCount = (obligationsResponse.data.results || obligationsResponse.data).length;
          } catch {
            // Ignore errors
          }

          return {
            ...law,
            category_name: category?.name || 'Unknown',
            related_obligations_count: obligationsCount,
          };
        })
      );

      setLaws(enrichedLaws);
    } catch (error) {
      console.error('Error fetching laws:', error);
      setSnackbar({ open: true, message: 'Failed to fetch laws', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedLaw(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleEdit = (law: LawResource) => {
    setSelectedLaw(law);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleDelete = async (law: LawResource) => {
    if (!window.confirm(`Are you sure you want to delete "${law.title}"?`)) return;

    try {
      await axiosInstance.delete(`/legals/resources/${law.id}/`);
      setSnackbar({ open: true, message: 'Law deleted successfully', severity: 'success' });
      fetchLaws();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete law', severity: 'error' });
    }
  };

  const handleView = (law: LawResource) => {
    // Expand the card
    console.log('View law:', law);
  };

  const handleFormSubmit = async (data: Partial<LawResource>) => {
    try {
      setLoading(true);
      if (formMode === 'create') {
        await axiosInstance.post('/legals/resources/', data);
        setSnackbar({ open: true, message: 'Law created successfully!', severity: 'success' });
      } else {
        await axiosInstance.put(`/legals/resources/${selectedLaw?.id}/`, data);
        setSnackbar({ open: true, message: 'Law updated successfully!', severity: 'success' });
      }
      setFormModalOpen(false);
      fetchLaws();
    } catch (error: any) {
      console.error('Error saving law:', error);
      const errorMessage = error.response?.data?.detail || 
                          JSON.stringify(error.response?.data) ||
                          `Failed to ${formMode} law`;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const activeLaws = laws.filter(l => !l.is_repealed);
  const repealedLaws = laws.filter(l => l.is_repealed);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          HSSE Law Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive repository of Health, Safety, Security, and Environmental laws and regulations
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                {laws.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Laws
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                {activeLaws.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Active Laws
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                {repealedLaws.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Repealed Laws
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
                {categories.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Search
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search laws..."
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

            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Country
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    displayEmpty
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>
                        {country.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Category
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Jurisdiction
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={jurisdictionFilter}
                    onChange={(e) => setJurisdictionFilter(e.target.value)}
                    displayEmpty
                  >
                    {JURISDICTION_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
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
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="false">Active</MenuItem>
                    <MenuItem value="true">Repealed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {isHSSEManager && (
              <Grid item xs={12} md={1}>
                <Box sx={{ pt: 2.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                    sx={{ height: 40 }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {laws.length} law{laws.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Laws List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading laws...</Typography>
        </Box>
      ) : laws.length === 0 ? (
        <Alert severity="info">No laws found. Adjust your filters or add new laws to the library.</Alert>
      ) : (
        laws.map((law) => (
          <LawCard
            key={law.id}
            law={law}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isHSSEManager={isHSSEManager}
          />
        ))
      )}

      {/* Form Modal */}
      <LawFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedLaw}
        mode={formMode}
        categories={categories}
      />

      {/* Snackbar */}
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

// Form Modal Component
const LawFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LawResource>) => void;
  initialData: LawResource | null;
  mode: 'create' | 'edit';
  categories: LawCategory[];
}> = ({ open, onClose, onSubmit, initialData, mode, categories }) => {
  const theme = useTheme();
  const [form, setForm] = useState<Partial<LawResource>>({});

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        is_repealed: false,
        jurisdiction: 'national',
        country: 'GH',
      });
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
        {mode === 'create' ? 'Add New Law to Library' : 'Edit Law'}
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
                placeholder="e.g., Labour Act, 2003"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Act/Law Number"
                name="act_number"
                value={form.act_number || ''}
                onChange={handleChange}
                placeholder="e.g., Act 651, L.I. 1724"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Country *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="country"
                    value={form.country || 'GH'}
                    onChange={(e) => handleSelectChange('country', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="GH">Ghana</MenuItem>
                    <MenuItem value="NG">Nigeria</MenuItem>
                    <MenuItem value="KE">Kenya</MenuItem>
                    <MenuItem value="ZA">South Africa</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Category *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="category"
                    value={form.category || ''}
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Jurisdiction *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="jurisdiction"
                    value={form.jurisdiction || 'national'}
                    onChange={(e) => handleSelectChange('jurisdiction', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="national">National</MenuItem>
                    <MenuItem value="district">District</MenuItem>
                    <MenuItem value="local">Local Authority</MenuItem>
                    <MenuItem value="industrial">Industrial</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Effective Date"
                type="date"
                name="effective_date"
                value={form.effective_date || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Status *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="is_repealed"
                    value={form.is_repealed ? 'true' : 'false'}
                    onChange={(e) => handleSelectChange('is_repealed', e.target.value === 'true')}
                  >
                    <MenuItem value="false">Active</MenuItem>
                    <MenuItem value="true">Repealed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Summary"
                name="summary"
                value={form.summary || ''}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Brief overview of what this law covers"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Enforcement Authority"
                name="enforcement_authority"
                value={form.enforcement_authority || ''}
                onChange={handleChange}
                placeholder="e.g., Environmental Protection Agency (EPA)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Authority Contact"
                name="authority_contact"
                value={form.authority_contact || ''}
                onChange={handleChange}
                placeholder="Contact details for enforcement authority"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Key Provisions"
                name="key_provisions"
                value={form.key_provisions || ''}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="List main sections and requirements (e.g., Section 12: Monthly inspections required)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Penalties for Non-Compliance"
                name="penalties"
                value={form.penalties || ''}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Fines, imprisonment, or other penalties"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Applicability"
                name="applicability"
                value={form.applicability || ''}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Who or what this law applies to (e.g., all workplaces, mining operations)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Official URL"
                name="official_url"
                value={form.official_url || ''}
                onChange={handleChange}
                placeholder="Link to official government source"
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
            {mode === 'create' ? 'Add Law' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ImprovedLawLibrary;

