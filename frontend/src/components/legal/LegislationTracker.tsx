import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Pagination, Alert, Chip, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
      .catch(() => setTrackers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrackers(); }, [page]);

  // Create Tracker
  const handleCreate = (data: FormData) => {
    setLoading(true);
    axiosInstance.post('/legals/legislation-trackers/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setSnackbar({ open: true, message: 'Tracker created successfully!' });
        setFormModalOpen(false);
        fetchTrackers();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to create tracker.' }))
      .finally(() => setLoading(false));
  };

  // Edit Tracker
  const handleEdit = (data: FormData) => {
    if (!selectedTracker) return;
    setLoading(true);
    axiosInstance.put(`/legals/legislation-trackers/${selectedTracker.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
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
      onSubmit(form);
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
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Permit</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Issuing Authority</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>License Number</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Unit</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Date of Issue</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Expiring Date</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Days Left</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Action Taken</TableCell>
                  <TableCell sx={{ fontSize: '0.92rem' }}>Evidence</TableCell>
                  {isHSSEManager && <TableCell sx={{ fontSize: '0.92rem' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {trackers.map(tracker => (
                  <TableRow key={tracker.id} hover onClick={() => {
                    setSelectedTracker(tracker);
                    setModalOpen(true);
                  }} style={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.permit}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.issuing_authority}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.license_number}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.unit}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.date_of_issue}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.expiring_date}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.days_left}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>
                      <Chip label={STATUS_CHOICES.find(s => s.value === tracker.status)?.label || tracker.status} color={statusColor(tracker.status)} size="small" />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>{tracker.action_taken}</TableCell>
                    <TableCell sx={{ fontSize: '0.92rem' }}>
                      {tracker.evidence_url ? (
                        <IconButton 
                          href={tracker.evidence_url} 
                          target="_blank" 
                          rel="noopener" 
                          size="small" 
                          sx={{ minWidth: 0, p: 0.5, color: 'error.main' }}
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Typography variant="caption" color="textSecondary">No Evidence</Typography>
                      )}
                    </TableCell>
                    {isHSSEManager && (
                      <TableCell sx={{ fontSize: '0.92rem' }}>
                        <IconButton onClick={e => { e.stopPropagation(); setFormMode('edit'); setFormState(tracker); setSelectedTracker(tracker); setFormModalOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton onClick={e => { e.stopPropagation(); setDeleteConfirm(tracker); }}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {trackers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isHSSEManager ? 11 : 10} align="center" sx={{ fontSize: '0.92rem' }}>No entries found.</TableCell>
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