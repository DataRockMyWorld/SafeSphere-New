import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, InputLabel, FormControl, Button, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Pagination, Alert, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
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
}

const JURISDICTION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'district', label: 'District' },
  { value: 'local', label: 'Local Authority' },
  { value: 'national', label: 'National' },
  { value: 'industrial', label: 'Industrial' },
];

const PAGE_SIZE = 10;

const LawDetailModal: React.FC<{ law: LawResource | null; open: boolean; onClose: () => void }> = ({ law, open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Law Details</DialogTitle>
    <DialogContent>
      {law ? (
        <Box>
          <Typography variant="h6" sx={{ fontSize: '0.92rem' }}>{law.title}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Country: {law.country}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Jurisdiction: {law.jurisdiction}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Category: {law.category}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Repealed: {law.is_repealed ? 'Yes' : 'No'}</Typography>
          <Typography variant="body1" sx={{ mt: 2, fontSize: '0.92rem' }}>{law.summary}</Typography>
          {/* If document field exists: */}
          {/* <Button href={law.document} target="_blank">Download Document</Button> */}
        </Box>
      ) : (
        <Typography sx={{ fontSize: '0.92rem' }}>No law selected.</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const LawFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LawResource>) => void;
  categories: LawCategory[];
  initialData?: Partial<LawResource>;
  mode: 'create' | 'edit';
}> = ({ open, onClose, onSubmit, categories, initialData = {}, mode }) => {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Create New Law' : 'Edit Law'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title" name="title" value={form.title || ''} onChange={handleChange} required fullWidth sx={{ fontSize: '0.92rem' }} />
          <TextField label="Country" name="country" value={form.country || ''} onChange={handleChange} required fullWidth sx={{ fontSize: '0.92rem' }} />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={form.category || ''} label="Category" onChange={handleChange} required>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '0.92rem' }}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Jurisdiction</InputLabel>
            <Select name="jurisdiction" value={form.jurisdiction || ''} label="Jurisdiction" onChange={handleChange} required>
              {JURISDICTION_OPTIONS.filter(j => j.value).map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.92rem' }}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Repealed</InputLabel>
            <Select name="is_repealed" value={form.is_repealed ? 'true' : 'false'} label="Repealed" onChange={e => setForm(f => ({ ...f, is_repealed: e.target.value === 'true' }))} required>
              <MenuItem value="false" sx={{ fontSize: '0.92rem' }}>No</MenuItem>
              <MenuItem value="true" sx={{ fontSize: '0.92rem' }}>Yes</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Summary" name="summary" value={form.summary || ''} onChange={handleChange} multiline rows={3} fullWidth sx={{ fontSize: '0.92rem' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{mode === 'create' ? 'Create' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const LawLibrary: React.FC = () => {
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

  // Helper to check if user is HSSE Manager
  const isHSSEManager = user?.position === 'HSSE MANAGER';

  useEffect(() => {
    // Fetch categories for filter dropdown
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

  // Create Law
  const handleCreateLaw = (data: Partial<LawResource>) => {
    setLoading(true);
    axiosInstance.post('/legals/resources/', data)
      .then(() => {
        setSnackbar({ open: true, message: 'Law created successfully!' });
        setModalOpen(false);
        fetchLaws();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to create law.' }))
      .finally(() => setLoading(false));
  };

  // Edit Law
  const handleEditLaw = (data: Partial<LawResource>) => {
    if (!selectedLaw) return;
    setLoading(true);
    axiosInstance.put(`/legals/resources/${selectedLaw.id}/`, data)
      .then(() => {
        setSnackbar({ open: true, message: 'Law updated successfully!' });
        setModalOpen(false);
        fetchLaws();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to update law.' }))
      .finally(() => setLoading(false));
  };

  // Delete Law
  const handleDeleteLaw = () => {
    if (!deleteConfirm) return;
    setLoading(true);
    axiosInstance.delete(`/legals/resources/${deleteConfirm.id}/`)
      .then(() => {
        setSnackbar({ open: true, message: 'Law deleted successfully!' });
        setDeleteConfirm(null);
        setModalOpen(false);
        fetchLaws();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to delete law.' }))
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ fontSize: '0.92rem' }}
        />
        <TextField
          label="Country"
          value={country}
          onChange={e => setCountry(e.target.value)}
          size="small"
          placeholder="e.g. GH"
          sx={{ fontSize: '0.92rem' }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={e => setCategory(e.target.value)}
            sx={{ fontSize: '0.92rem' }}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '0.92rem' }}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Jurisdiction</InputLabel>
          <Select
            value={jurisdiction}
            label="Jurisdiction"
            onChange={e => setJurisdiction(e.target.value)}
            sx={{ fontSize: '0.92rem' }}
          >
            {JURISDICTION_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.92rem' }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Repealed</InputLabel>
          <Select
            value={isRepealed}
            label="Repealed"
            onChange={e => setIsRepealed(e.target.value)}
            sx={{ fontSize: '0.92rem' }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchLaws} sx={{ minWidth: 100, fontSize: '0.92rem' }}>Filter</Button>
        {isHSSEManager && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setModalMode('create');
              setFormState({});
              setModalOpen(true);
            }}
            sx={{ minWidth: 120, fontSize: '0.92rem' }}
          >
            New Law
          </Button>
        )}
      </Box>
      <Paper sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: 'primary.main',
                  '& th': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    padding: '12px 8px',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.dark',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }
                }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Repealed</TableCell>
                  <TableCell>Summary</TableCell>
                  {isHSSEManager && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {laws.map(law => (
                  <TableRow 
                    key={law.id} 
                    hover 
                    onClick={() => {
                      if (!isHSSEManager) {
                        setSelectedLaw(law);
                        setModalMode('detail');
                        setModalOpen(true);
                      }
                    }} 
                    style={{ cursor: !isHSSEManager ? 'pointer' : 'default' }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transition: 'background-color 0.2s ease'
                      },
                      '& td': {
                        padding: '8px',
                        fontSize: '0.85rem',
                        borderBottom: '1px solid #e0e0e0',
                        verticalAlign: 'middle'
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: '#fafafa'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{law.title}</TableCell>
                    <TableCell>{law.country}</TableCell>
                    <TableCell>{categories.find(c => c.id === law.category)?.name || law.category}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{law.jurisdiction}</TableCell>
                    <TableCell>
                      <Chip 
                        label={law.is_repealed ? 'Yes' : 'No'} 
                        color={law.is_repealed ? 'error' : 'success'} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {law.summary}
                    </TableCell>
                    {isHSSEManager && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedLaw(law);
                              setModalMode('detail');
                              setModalOpen(true);
                            }}
                            size="small"
                            sx={{ 
                              color: 'info.main',
                              '&:hover': {
                                backgroundColor: 'rgba(3, 169, 244, 0.1)',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedLaw(law);
                              setFormState(law);
                              setModalMode('edit');
                              setModalOpen(true);
                            }}
                            size="small"
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={e => {
                              e.stopPropagation();
                              setDeleteConfirm(law);
                              setModalMode('delete');
                              setModalOpen(true);
                            }}
                            size="small"
                            sx={{ 
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {laws.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={isHSSEManager ? 7 : 6} 
                      align="center" 
                      sx={{ 
                        fontSize: '0.85rem',
                        color: 'text.secondary',
                        padding: '32px 16px',
                        fontStyle: 'italic'
                      }}
                    >
                      No laws found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => {
          setPage(value);
        }}
        sx={{ display: 'flex', justifyContent: 'center', mt: 2, fontSize: '0.92rem' }}
      />
      {/* Modals */}
      <LawDetailModal
        law={selectedLaw}
        open={modalOpen && modalMode === 'detail'}
        onClose={() => setModalOpen(false)}
      />
      <LawFormModal
        open={modalOpen && (modalMode === 'create' || modalMode === 'edit')}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === 'create' ? handleCreateLaw : handleEditLaw}
        categories={categories}
        initialData={modalMode === 'edit' ? formState : {}}
        mode={modalMode as 'create' | 'edit'}
      />
      <Dialog open={modalOpen && modalMode === 'delete'} onClose={() => setModalOpen(false)}>
        <DialogTitle>Delete Law</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.92rem' }}>Are you sure you want to delete this law?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteLaw}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '' })}
      >
        <Alert onClose={() => setSnackbar({ open: false, message: '' })} severity="success">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LawLibrary; 