import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Button, 
  CircularProgress, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Pagination, 
  Alert, 
  Chip,
  Card,
  CardContent,
  useTheme,
  alpha,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon,
  Search as SearchIcon,
  Gavel as GavelIcon,
  Policy as PolicyIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface LawCategory {
  id: number;
  name: string;
}

interface LawResource {
  id: number;
  title: string;
  country: string;
  category: number;
  jurisdiction: string;
  is_repealed: boolean;
  summary: string;
  created_at?: string;
  updated_at?: string;
}

const JURISDICTION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'district', label: 'District' },
  { value: 'local', label: 'Local Authority' },
  { value: 'national', label: 'National' },
  { value: 'industrial', label: 'Industrial' },
];

const PAGE_SIZE = 10;

const LawDetailModal: React.FC<{ law: LawResource | null; open: boolean; onClose: () => void }> = ({ law, open, onClose }) => {
  const theme = useTheme();
  
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
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.25rem',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon />
          Law Details
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {law ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
              {law.title}
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Country</Typography>
                  <Typography variant="body2" fontWeight={500}>{law.country}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Jurisdiction</Typography>
                  <Typography variant="body2" fontWeight={500}>{law.jurisdiction}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PolicyIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body2" fontWeight={500}>{law.category}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {law.is_repealed ? <WarningIcon color="error" /> : <CheckCircleIcon color="success" />}
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {law.is_repealed ? 'Repealed' : 'Active'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ 
              lineHeight: 1.6,
              color: theme.palette.text.secondary,
              background: alpha(theme.palette.grey[50], 0.5),
              p: 2,
              borderRadius: 2,
            }}>
              {law.summary}
            </Typography>
          </Box>
        ) : (
          <Typography>No law selected.</Typography>
        )}
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const LawFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LawResource>) => void;
  categories: LawCategory[];
  initialData?: Partial<LawResource>;
  mode: 'create' | 'edit';
}> = ({ open, onClose, onSubmit, categories, initialData = {}, mode }) => {
  const theme = useTheme();
  const [form, setForm] = useState<Partial<LawResource>>(initialData);
  
  useEffect(() => { setForm(initialData); }, [initialData, open]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name!]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.25rem',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon />
          {mode === 'create' ? 'Create New Law' : 'Edit Law'}
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField 
            label="Title" 
            name="title" 
            value={form.title || ''} 
            onChange={handleChange} 
            required 
            fullWidth 
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <TextField 
            label="Country" 
            name="country" 
            value={form.country || ''} 
            onChange={handleChange} 
            required 
            fullWidth 
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select 
              name="category" 
              value={form.category || ''} 
              label="Category" 
              onChange={handleChange} 
              required
              sx={{ 
                borderRadius: 2,
              }}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Jurisdiction</InputLabel>
            <Select 
              name="jurisdiction" 
              value={form.jurisdiction || ''} 
              label="Jurisdiction" 
              onChange={handleChange} 
              required
              sx={{ 
                borderRadius: 2,
              }}
            >
              {JURISDICTION_OPTIONS.filter(j => j.value).map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select 
              name="is_repealed" 
              value={form.is_repealed ? 'true' : 'false'} 
              label="Status" 
              onChange={e => setForm(f => ({ ...f, is_repealed: e.target.value === 'true' }))} 
              required
              sx={{ 
                borderRadius: 2,
              }}
            >
              <MenuItem value="false">Active</MenuItem>
              <MenuItem value="true">Repealed</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label="Summary" 
            name="summary" 
            value={form.summary || ''} 
            onChange={handleChange} 
            multiline 
            rows={4} 
            fullWidth 
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
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
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706, #b45309)',
              }
            }}
          >
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const LawLibrary: React.FC = () => {
  const theme = useTheme();
  const [laws, setLaws] = useState<LawResource[]>([]);
  const [categories, setCategories] = useState<LawCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [isRepealed, setIsRepealed] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<LawResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'detail' | 'create' | 'edit'>('detail');
  const [formState, setFormState] = useState<Partial<LawResource>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<LawResource | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const isHSSEManager = user?.position === 'HSSE MANAGER';

  useEffect(() => {
    axiosInstance.get('/legals/categories/')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const fetchLaws = () => {
    setLoading(true);
    const params: any = { page, page_size: PAGE_SIZE };
    if (search) params.search = search;
    if (country) params.country = country;
    if (category) params.category = category;
    if (jurisdiction) params.jurisdiction = jurisdiction;
    if (isRepealed) params.is_repealed = isRepealed;
    
    axiosInstance.get('/legals/resources/', { params })
      .then(res => {
        setLaws(res.data.results || res.data);
        setTotalPages(res.data.total_pages || 1);
      })
      .catch(() => setLaws([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLaws(); }, [page]);

  const handleCreate = () => {
    setFormState({});
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (law: LawResource) => {
    setFormState(law);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (law: LawResource) => {
    setDeleteConfirm(law);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      axiosInstance.delete(`/legals/resources/${deleteConfirm.id}/`)
        .then(() => {
          setSnackbar({open: true, message: 'Law deleted successfully'});
          fetchLaws();
        })
        .catch(() => setSnackbar({open: true, message: 'Failed to delete law'}))
        .finally(() => setDeleteConfirm(null));
    }
  };

  const handleSubmit = (data: Partial<LawResource>) => {
    const url = modalMode === 'create' ? '/legals/resources/' : `/legals/resources/${formState.id}/`;
    const method = modalMode === 'create' ? 'post' : 'put';
    
    axiosInstance[method](url, data)
      .then(() => {
        setSnackbar({open: true, message: `Law ${modalMode === 'create' ? 'created' : 'updated'} successfully`});
        setModalOpen(false);
        fetchLaws();
      })
      .catch(() => setSnackbar({open: true, message: `Failed to ${modalMode === 'create' ? 'create' : 'update'} law`}));
  };

  const handleView = (law: LawResource) => {
    setSelectedLaw(law);
    setModalMode('detail');
    setModalOpen(true);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh', 
      overflow: 'auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      position: 'relative',
    }}>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b, #475569)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Law Library
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 400,
            }}
          >
            Browse and manage legal resources and legislation
          </Typography>
        </Box>

        {/* Filters and Actions */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField
                placeholder="Search laws..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Country</InputLabel>
                <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="GH">Ghana</MenuItem>
                  <MenuItem value="NG">Nigeria</MenuItem>
                  <MenuItem value="KE">Kenya</MenuItem>
                  <MenuItem value="ZA">South Africa</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Jurisdiction</InputLabel>
                <Select value={jurisdiction} label="Jurisdiction" onChange={(e) => setJurisdiction(e.target.value)}>
                  {JURISDICTION_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select value={isRepealed} label="Status" onChange={(e) => setIsRepealed(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="false">Active</MenuItem>
                  <MenuItem value="true">Repealed</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={fetchLaws}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                  },
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Apply Filters
              </Button>
            </Box>
            
            {isHSSEManager && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669, #047857)',
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Add New Law
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Jurisdiction</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : laws.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No laws found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  laws.map((law) => (
                    <TableRow 
                      key={law.id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: alpha(theme.palette.grey[50], 0.3),
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {law.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={law.country} 
                          size="small" 
                          sx={{ 
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {law.jurisdiction}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {categories.find(cat => cat.id === law.category)?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={law.is_repealed ? 'Repealed' : 'Active'}
                          color={law.is_repealed ? 'error' : 'success'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleView(law)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <GavelIcon />
                            </IconButton>
                          </Tooltip>
                          {isHSSEManager && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEdit(law)}
                                  sx={{ color: theme.palette.warning.main }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDelete(law)}
                                  sx={{ color: theme.palette.error.main }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>

        {/* Modals */}
        <LawDetailModal 
          law={selectedLaw} 
          open={modalOpen && modalMode === 'detail'} 
          onClose={() => setModalOpen(false)} 
        />
        
        <LawFormModal
          open={modalOpen && (modalMode === 'create' || modalMode === 'edit')}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          categories={categories}
          initialData={formState}
          mode={modalMode}
        />

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete "{deleteConfirm?.title}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({open: false, message: ''})}
        >
          <Alert onClose={() => setSnackbar({open: false, message: ''})} severity="success">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default LawLibrary;