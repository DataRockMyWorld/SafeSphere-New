import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, InputLabel, FormControl, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Pagination, Alert, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 10;

const DEPARTMENTS = [
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HSSE', label: 'HSSE' },
  { value: 'FINANCE', label: 'Finance' },
];
const COMPLIANCE_STATUS = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'non-compliant', label: 'Non-compliant' },
  { value: 'partial', label: 'Partial' },
];

// Common countries for dropdown
const COUNTRIES = [
  { value: 'GH', label: 'Ghana' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'EG', label: 'Egypt' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
];

// Common categories for dropdown
// const CATEGORIES = [ ... ];

interface LawCategory { id: number; name: string; }
interface Position { id: number; name: string; }
interface LawResource { id: number; title: string; }
interface LegalRegisterEntry {
  id: number;
  title: string;
  regulatory_requirement: string;
  owner_department: string;
  legislation_reference: number;
  last_updated: string;
  action: string;
  evaluation_compliance: string;
  compliance_status: string;
  assigned_to: Position[];
  assigned_to_ids?: number[];
  further_actions: string;
  country: string;
  category: string;
  legal_obligation: string;
  related_legislation?: number[];
}

const LegalRegister: React.FC = () => {
  const [entries, setEntries] = useState<LegalRegisterEntry[]>([]);
  const [laws, setLaws] = useState<LawResource[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [categories, setCategories] = useState<LawCategory[]>([]); // <-- Add this
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [lawResource, setLawResource] = useState('');
  const [complianceStatus, setComplianceStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<LegalRegisterEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<Partial<LegalRegisterEntry>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<LegalRegisterEntry | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const { user } = useAuth();
  const isHSSEManager = user?.position === 'HSSE MANAGER';

  useEffect(() => {
    axiosInstance.get('/legals/resources/').then(res => setLaws(res.data.results || res.data)).catch(() => setLaws([]));
    axiosInstance.get('/legals/positions/').then(res => setPositions(res.data.results || res.data)).catch(() => setPositions([]));
    axiosInstance.get('/legals/categories/').then(res => setCategories(res.data)).catch(() => setCategories([])); // <-- Fetch categories
  }, []);

  const fetchEntries = () => {
    setLoading(true);
    const params: any = { page, page_size: PAGE_SIZE };
    if (search) params.search = search;
    if (department) params.owner_department = department;
    if (lawResource) params.legislation_reference = lawResource;
    if (complianceStatus) params.compliance_status = complianceStatus;
    axiosInstance.get('/legals/register-entries/', { params })
      .then(res => {
        setEntries(res.data.results || res.data);
        setTotalPages(res.data.total_pages || 1);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchEntries(); }, [page]);

  // Create
  const handleCreate = (data: Partial<LegalRegisterEntry>) => {
    setLoading(true);
    axiosInstance.post('/legals/register-entries/', data)
      .then(() => {
        setSnackbar({ open: true, message: 'Entry created successfully!' });
        setFormModalOpen(false);
        fetchEntries();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to create entry.' }))
      .finally(() => setLoading(false));
  };
  // Edit
  const handleEdit = (data: Partial<LegalRegisterEntry>) => {
    if (!selectedEntry) return;
    setLoading(true);
    axiosInstance.put(`/legals/register-entries/${selectedEntry.id}/`, data)
      .then(() => {
        setSnackbar({ open: true, message: 'Entry updated successfully!' });
        setFormModalOpen(false);
        fetchEntries();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to update entry.' }))
      .finally(() => setLoading(false));
  };
  // Delete
  const handleDelete = () => {
    if (!deleteConfirm) return;
    setLoading(true);
    axiosInstance.delete(`/legals/register-entries/${deleteConfirm.id}/`)
      .then(() => {
        setSnackbar({ open: true, message: 'Entry deleted successfully!' });
        setDeleteConfirm(null);
        fetchEntries();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to delete entry.' }))
      .finally(() => setLoading(false));
  };

  // Form modal for create/edit
  const RegisterFormModal = ({ open, onClose, onSubmit, initialData, mode }: any) => {
    const [form, setForm] = useState<Partial<LegalRegisterEntry>>(initialData || {});
    useEffect(() => { setForm(initialData || {}); }, [initialData, open]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
      const { name, value } = e.target;
      setForm(f => ({ ...f, [name!]: value }));
    };
    const handleMultiChange = (e: any) => {
      setForm(f => ({ ...f, assigned_to_ids: e.target.value }));
    };
    const handleRelatedLegislationChange = (e: any) => {
      setForm(f => ({ ...f, related_legislation: e.target.value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(form);
    };
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{mode === 'create' ? 'Create New Register Entry' : 'Edit Register Entry'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={form.title || ''} onChange={handleChange} required fullWidth />
            <TextField label="Regulatory Requirement" name="regulatory_requirement" value={form.regulatory_requirement || ''} onChange={handleChange} required fullWidth multiline rows={3} />
            <FormControl fullWidth>
              <InputLabel>Owner Department</InputLabel>
              <Select name="owner_department" value={form.owner_department || ''} label="Owner Department" onChange={handleChange} required>
                {DEPARTMENTS.map(dep => (
                  <MenuItem key={dep.value} value={dep.value}>{dep.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select name="country" value={form.country || ''} label="Country" onChange={handleChange} required>
                {COUNTRIES.map(country => (
                  <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={form.category || ''} label="Category" onChange={handleChange} required>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Legal Obligation" name="legal_obligation" value={form.legal_obligation || ''} onChange={handleChange} required fullWidth multiline rows={3} />
            <FormControl fullWidth>
              <InputLabel>Legislation Reference</InputLabel>
              <Select name="legislation_reference" value={form.legislation_reference || ''} label="Legislation Reference" onChange={handleChange} required>
                {laws.map(law => (
                  <MenuItem key={law.id} value={law.id}>{law.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Related Legislation</InputLabel>
              <Select
                name="related_legislation"
                multiple
                value={form.related_legislation || []}
                onChange={handleRelatedLegislationChange}
                renderValue={(selected: any) => laws.filter(l => selected.includes(l.id)).map(l => l.title).join(', ')}
              >
                {laws.map(law => (
                  <MenuItem key={law.id} value={law.id}>{law.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Action" name="action" value={form.action || ''} onChange={handleChange} required fullWidth multiline rows={2} />
            <TextField label="Evaluation Compliance" name="evaluation_compliance" value={form.evaluation_compliance || ''} onChange={handleChange} required fullWidth multiline rows={3} />
            <FormControl fullWidth>
              <InputLabel>Compliance Status</InputLabel>
              <Select name="compliance_status" value={form.compliance_status || ''} label="Compliance Status" onChange={handleChange} required>
                {COMPLIANCE_STATUS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assigned_to_ids"
                multiple
                value={form.assigned_to_ids || []}
                onChange={handleMultiChange}
                renderValue={(selected: any) => positions.filter(p => selected.includes(p.id)).map(p => p.name).join(', ')}
              >
                {positions.map(pos => (
                  <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Further Actions" name="further_actions" value={form.further_actions || ''} onChange={handleChange} fullWidth multiline rows={2} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">{mode === 'create' ? 'Create' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h6" mb={2} sx={{ fontSize: '0.92rem' }}>Legal Register</Typography>
      {isHSSEManager && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormMode('create');
            setFormState({});
            setFormModalOpen(true);
          }}
          sx={{ mb: 2 }}
        >
          New Register Entry
        </Button>
      )}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select value={department} label="Department" onChange={e => setDepartment(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {DEPARTMENTS.map(dep => (
              <MenuItem key={dep.value} value={dep.value}>{dep.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Legislation Reference</InputLabel>
          <Select value={lawResource} label="Legislation Reference" onChange={e => setLawResource(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {laws.map(law => (
              <MenuItem key={law.id} value={law.id}>{law.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Compliance Status</InputLabel>
          <Select value={complianceStatus} label="Compliance Status" onChange={e => setComplianceStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {COMPLIANCE_STATUS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchEntries} sx={{ minWidth: 100 }}>Filter</Button>
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
                  <TableCell>Owner Department</TableCell>
                  <TableCell>Compliance Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  {isHSSEManager && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(entry => (
                  <TableRow 
                    key={entry.id} 
                    hover 
                    onClick={() => {
                      setSelectedEntry(entry);
                      setModalOpen(true);
                    }} 
                    style={{ cursor: 'pointer' }}
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
                    <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{entry.title}</TableCell>
                    <TableCell>{COUNTRIES.find(c => c.value === entry.country)?.label || entry.country}</TableCell>
                    <TableCell>{categories.find(c => c.name === entry.category)?.name || entry.category}</TableCell>
                    <TableCell>{DEPARTMENTS.find(d => d.value === entry.owner_department)?.label || entry.owner_department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={COMPLIANCE_STATUS.find(c => c.value === entry.compliance_status)?.label || entry.compliance_status} 
                        color={entry.compliance_status === 'compliant' ? 'success' : entry.compliance_status === 'non-compliant' ? 'error' : 'warning'} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>{entry.last_updated ? new Date(entry.last_updated).toLocaleDateString() : ''}</TableCell>
                    {isHSSEManager && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            onClick={e => { 
                              e.stopPropagation(); 
                              setFormMode('edit'); 
                              setFormState(entry); 
                              setSelectedEntry(entry); 
                              setFormModalOpen(true); 
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
                            onClick={e => { e.stopPropagation(); setDeleteConfirm(entry); }}
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
                {entries.length === 0 && (
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
                      No entries found.
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
        sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
      />
      {/* Detail Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Legal Register Entry Details</DialogTitle>
        <DialogContent>
          {selectedEntry ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '0.92rem', fontWeight: 600 }}>{selectedEntry.title}</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Country</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{COUNTRIES.find(c => c.value === selectedEntry.country)?.label || selectedEntry.country}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{categories.find(c => c.name === selectedEntry.category)?.name || selectedEntry.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Owner Department</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{DEPARTMENTS.find(d => d.value === selectedEntry.owner_department)?.label || selectedEntry.owner_department}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Compliance Status</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{COMPLIANCE_STATUS.find(c => c.value === selectedEntry.compliance_status)?.label || selectedEntry.compliance_status}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Last Updated</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.last_updated ? new Date(selectedEntry.last_updated).toLocaleDateString() : ''}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Legislation Reference</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{laws.find(l => l.id === selectedEntry.legislation_reference)?.title || selectedEntry.legislation_reference}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Regulatory Requirement</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.regulatory_requirement}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Legal Obligation</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.legal_obligation}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Action</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.action}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Evaluation Compliance</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.evaluation_compliance}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Assigned To</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.assigned_to?.map(p => p.name).join(', ') || 'None'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Further Actions</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{selectedEntry.further_actions || 'None'}</Typography>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.92rem' }}>No entry selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Create/Edit Modal */}
      <RegisterFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={formMode === 'create' ? handleCreate : handleEdit}
        initialData={formMode === 'edit' ? formState : {}}
        mode={formMode}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Register Entry</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.92rem' }}>Are you sure you want to delete this entry?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
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

export default LegalRegister; 