import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Pagination, Alert, Chip, IconButton, FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const STATUS_CHOICES = [
  { value: 'valid', label: 'Valid' },
  { value: 'expired', label: 'Expired' },
];

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

const PAGE_SIZE = 10;

const statusColor = (status: string) => {
  if (status === 'valid') return 'success';
  if (status === 'expired') return 'error';
  return 'default';
};

const LegislationTrackerComponent: React.FC = () => {
  const [trackers, setTrackers] = useState<LegislationTracker[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTracker, setSelectedTracker] = useState<LegislationTracker | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<Partial<LegislationTracker>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<LegislationTracker | null>(null);
  const { user } = useAuth();
  const isHSSEManager = user?.position === 'HSSE MANAGER';

  const fetchTrackers = () => {
    setLoading(true);
    axiosInstance.get('/legals/legislation-trackers/', { params: { page, page_size: PAGE_SIZE } })
      .then(res => {
        setTrackers(res.data.results || res.data);
        setTotalPages(res.data.total_pages || 1);
      })
      .catch((error) => {
        console.error('Error fetching trackers:', error);
        setTrackers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrackers(); }, [page]);

  // Create Tracker
  const handleCreate = (data: Partial<LegislationTracker> & { evidenceFile?: File }) => {
    setLoading(true);
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(data).forEach(key => {
      if (key === 'evidenceFile' && data.evidenceFile) {
        formData.append('evidence', data.evidenceFile);
      } else if (key !== 'evidenceFile' && data[key] !== undefined) {
        formData.append(key, data[key] as string);
      }
    });

    axiosInstance.post('/legals/legislation-trackers/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setSnackbar({ open: true, message: 'Tracker created successfully!' });
        setFormModalOpen(false);
        fetchTrackers();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to create tracker.' }))
      .finally(() => setLoading(false));
  };

  // Edit Tracker
  const handleEdit = (data: Partial<LegislationTracker> & { evidenceFile?: File }) => {
    if (!selectedTracker) return;
    setLoading(true);
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(data).forEach(key => {
      if (key === 'evidenceFile' && data.evidenceFile) {
        formData.append('evidence', data.evidenceFile);
      } else if (key !== 'evidenceFile' && data[key] !== undefined) {
        formData.append(key, data[key] as string);
      }
    });

    axiosInstance.put(`/legals/legislation-trackers/${selectedTracker.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setSnackbar({ open: true, message: 'Tracker updated successfully!' });
        setFormModalOpen(false);
        fetchTrackers();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to update tracker.' }))
      .finally(() => setLoading(false));
  };

  // Delete Tracker
  const handleDelete = () => {
    if (!deleteConfirm) return;
    setLoading(true);
    axiosInstance.delete(`/legals/legislation-trackers/${deleteConfirm.id}/`)
      .then(() => {
        setSnackbar({ open: true, message: 'Tracker deleted successfully!' });
        setDeleteConfirm(null);
        fetchTrackers();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to delete tracker.' }))
      .finally(() => setLoading(false));
  };

  // Form modal for create/edit
  const TrackerFormModal = ({ open, onClose, onSubmit, initialData, mode }: any) => {
    const [form, setForm] = useState<Partial<LegislationTracker>>(initialData || {});
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    useEffect(() => { setForm(initialData || {}); }, [initialData, open]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
      const { name, value } = e.target;
      setForm(f => ({ ...f, [name!]: value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = { ...form };
      if (evidenceFile) {
        submitData.evidenceFile = evidenceFile;
      }
      onSubmit(submitData);
    };
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{mode === 'create' ? 'Create New Tracker' : 'Edit Tracker'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Permit" name="permit" value={form.permit || ''} onChange={handleChange} required fullWidth />
            <TextField label="Issuing Authority" name="issuing_authority" value={form.issuing_authority || ''} onChange={handleChange} required fullWidth />
            <TextField label="License Number" name="license_number" value={form.license_number || ''} onChange={handleChange} required fullWidth />
            <TextField label="Unit" name="unit" value={form.unit || ''} onChange={handleChange} required fullWidth />
            <TextField label="Date of Issue" name="date_of_issue" type="date" value={form.date_of_issue || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="Expiring Date" name="expiring_date" type="date" value={form.expiring_date || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} required fullWidth />
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={form.status || ''}
                label="Status"
                onChange={handleChange}
              >
                {STATUS_CHOICES.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Action Taken" name="action_taken" value={form.action_taken || ''} onChange={handleChange} required fullWidth />
            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              {evidenceFile ? evidenceFile.name : (form.evidence_url ? 'Change Evidence PDF' : 'Upload Evidence PDF')}
              <input type="file" accept="application/pdf" hidden onChange={e => {
                if (e.target.files && e.target.files[0]) setEvidenceFile(e.target.files[0]);
              }} />
            </Button>
            {form.evidence_url && (
              <Button href={form.evidence_url} target="_blank" rel="noopener" sx={{ ml: 2 }}>
                Preview Current Evidence
              </Button>
            )}
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
      <Typography variant="h6" mb={2} sx={{ fontSize: '0.92rem' }}>Legislation Tracker</Typography>
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
          New Tracker
        </Button>
      )}
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
                  <TableCell>Permit</TableCell>
                  <TableCell>Issuing Authority</TableCell>
                  <TableCell>License Number</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Date of Issue</TableCell>
                  <TableCell>Expiring Date</TableCell>
                  <TableCell>Days Left</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action Taken</TableCell>
                  <TableCell>Evidence</TableCell>
                  {isHSSEManager && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {trackers.map(tracker => (
                  <TableRow 
                    key={tracker.id} 
                    hover 
                    onClick={() => {
                      setSelectedTracker(tracker);
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
                    <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{tracker.permit}</TableCell>
                    <TableCell>{tracker.issuing_authority}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tracker.license_number}</TableCell>
                    <TableCell>{tracker.unit}</TableCell>
                    <TableCell>{tracker.date_of_issue}</TableCell>
                    <TableCell>{tracker.expiring_date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={tracker.days_left} 
                        size="small" 
                        color={tracker.days_left <= 30 ? 'error' : tracker.days_left <= 90 ? 'warning' : 'success'}
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          minWidth: '40px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={STATUS_CHOICES.find(s => s.value === tracker.status)?.label || tracker.status} 
                        color={statusColor(tracker.status)} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tracker.action_taken}
                    </TableCell>
                    <TableCell>
                      {tracker.evidence_url ? (
                        <Tooltip title="View Evidence PDF">
                          <IconButton 
                            href={tracker.evidence_url} 
                            target="_blank" 
                            rel="noopener" 
                            size="small" 
                            sx={{ 
                              minWidth: 0, 
                              p: 0.5, 
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <PdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                          No Evidence
                        </Typography>
                      )}
                    </TableCell>
                    {isHSSEManager && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            onClick={e => { 
                              e.stopPropagation(); 
                              setFormMode('edit'); 
                              setFormState(tracker); 
                              setSelectedTracker(tracker); 
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
                            onClick={e => { e.stopPropagation(); setDeleteConfirm(tracker); }}
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
                {trackers.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={isHSSEManager ? 11 : 10} 
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
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Legislation Tracker Details</DialogTitle>
        <DialogContent>
          {selectedTracker ? (
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.92rem' }}>{selectedTracker.permit}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Issuing Authority: {selectedTracker.issuing_authority}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>License Number: {selectedTracker.license_number}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Unit: {selectedTracker.unit}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Date of Issue: {selectedTracker.date_of_issue}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Expiring Date: {selectedTracker.expiring_date}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Days Left: {selectedTracker.days_left}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Status: <Chip label={STATUS_CHOICES.find(s => s.value === selectedTracker.status)?.label || selectedTracker.status} color={statusColor(selectedTracker.status)} size="small" /></Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.92rem' }}>Action Taken: {selectedTracker.action_taken}</Typography>
              {selectedTracker?.evidence_url && (
                <Button href={selectedTracker.evidence_url} target="_blank" rel="noopener" sx={{ mt: 1 }}>
                  Preview Evidence PDF
                </Button>
              )}
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
      <TrackerFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={formMode === 'create' ? handleCreate : handleEdit}
        initialData={formMode === 'edit' ? formState : {}}
        mode={formMode}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Tracker</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.92rem' }}>Are you sure you want to delete this tracker?</Typography>
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

export default LegislationTrackerComponent; 