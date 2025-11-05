import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Button,
  Typography,
  Chip,
  IconButton,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExcelIcon,
  CheckCircle as ApproveIcon,
  UploadFile as UploadIcon,
  ViewColumn as ColumnsIcon,
} from '@mui/icons-material';
import { RisksApi } from './api';
import type { RiskAssessment } from './types';
import { useAuth } from '../../context/AuthContext';
import RiskAssessmentForm from './RiskAssessmentForm';

// moved to ./types

const RiskRegister: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof RiskAssessment>('event_number');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState('ALL');
  const [filterSite, setFilterSite] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sites, setSites] = useState<string[]>([]);
  const [columnMenuOpen, setColumnMenuOpen] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    assessmentDate: true,
    category: true,
    activity: true,
    initialRisk: true,
    residualRisk: true,
    assessedBy: true,
    riskOwner: true,
    status: true,
    nextReview: true,
    hazards: true,
    barriers: true,
    acceptable: true,
  });
  
  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RisksApi.fetchAssessments({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        category: filterCategory !== 'ALL' ? filterCategory : undefined,
        site: filterSite !== 'ALL' ? filterSite : undefined,
      });
      setAssessments(data);
      const uniqueSites: string[] = Array.from(
        new Set(
          ((data || []) as RiskAssessment[])
            .map((a) => a.location)
            .filter((v): v is string => Boolean(v))
        )
      );
      setSites(uniqueSites);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      showSnackbar('Failed to load risk assessments', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, filterStatus, filterCategory, filterSite]);
  
  useEffect(() => {
    fetchAssessments();
    try {
      const key = `risk_columns_${user?.role || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) setVisibleColumns((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}
  }, [fetchAssessments]);
  
  const handleExportExcel = useCallback(async () => {
    try {
      const response = await RisksApi.exportExcel({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        category: filterCategory !== 'ALL' ? filterCategory : undefined,
        site: filterSite !== 'ALL' ? filterSite : undefined,
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Risk_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar('Excel file downloaded successfully', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showSnackbar('Failed to export Excel file', 'error');
    }
  }, [filterStatus, filterCategory, showSnackbar]);
  
  const handleSort = useCallback((property: keyof RiskAssessment) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);
  
  const handleDelete = useCallback(async (id: string, eventNumber: string) => {
    if (!window.confirm(`Delete risk assessment ${eventNumber}?`)) return;
    
    try {
      await RisksApi.deleteAssessment(id);
      showSnackbar('Risk assessment deleted', 'success');
      fetchAssessments();
    } catch (error) {
      showSnackbar('Failed to delete', 'error');
    }
  }, [fetchAssessments, showSnackbar]);
  
  const handleApprove = useCallback(async (id: string) => {
    try {
      await RisksApi.approveAssessment(id);
      showSnackbar('Risk assessment approved', 'success');
      fetchAssessments();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to approve', 'error');
    }
  }, [fetchAssessments, showSnackbar]);
  
  const openCreateDialog = useCallback(() => {
    setEditingAssessment(null);
    setFormDialog(true);
  }, []);

  // Import Excel
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleOpenImport = () => fileInputRef.current?.click();
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await RisksApi.importExcel(file);
      showSnackbar('Import completed successfully', 'success');
      fetchAssessments();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Import failed. Please verify the template.';
      showSnackbar(msg, 'error');
    } finally {
      // reset input to allow re-selecting the same file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // Filter and sort data
  const filteredAndSorted = React.useMemo(() => {
    let filtered = assessments.filter(assessment => {
      if (filterStatus !== 'ALL' && assessment.status !== filterStatus) return false;
      if (filterSite !== 'ALL' && assessment.location !== filterSite) return false;
      if (filterCategory !== 'ALL' && assessment.risk_category !== filterCategory) return false;
      if (filterRiskLevel !== 'ALL') {
        if (filterRiskLevel === 'LOW' && assessment.residual_risk_level > 5) return false;
        if (filterRiskLevel === 'MEDIUM' && (assessment.residual_risk_level <= 5 || assessment.residual_risk_level >= 15)) return false;
        if (filterRiskLevel === 'HIGH' && assessment.residual_risk_level < 15) return false;
      }
      if (searchTerm && !assessment.event_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !assessment.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !assessment.process_area.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      
      if (aVal === bVal) return 0;
      if (order === 'asc') {
        return aVal < bVal ? -1 : 1;
      } else {
        return aVal > bVal ? -1 : 1;
      }
    });
    
    return filtered;
  }, [assessments, filterStatus, filterCategory, filterRiskLevel, filterSite, searchTerm, orderBy, order]);
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Risk Register
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(user?.position === 'HSSE MANAGER' || user?.is_superuser) 
              ? 'Comprehensive risk assessment table with Excel export'
              : 'Read-only view - Contact HSSE Manager to create or modify assessments'
            }
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ColumnsIcon />}
            onClick={(e) => setColumnMenuOpen(e.currentTarget)}
          >
            Columns
          </Button>
          {columnMenuOpen && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                zIndex: 10,
                mt: 5,
                right: 16,
                p: 1,
                borderRadius: 1,
              }}
              onMouseLeave={() => setColumnMenuOpen(null)}
            >
              <Stack sx={{ p: 1 }} spacing={0.5}>
                {Object.keys(visibleColumns).map((key) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[key]}
                      onChange={(e) => {
                        const next = { ...visibleColumns, [key]: e.target.checked } as typeof visibleColumns;
                        setVisibleColumns(next);
                        try {
                          const storageKey = `risk_columns_${user?.role || 'default'}`;
                          localStorage.setItem(storageKey, JSON.stringify(next));
                        } catch {}
                      }}
                    />
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                  </label>
                ))}
              </Stack>
            </Paper>
          )}
          
          {/* Action buttons - Only for HSSE Manager/Admin */}
          {(user?.position === 'HSSE MANAGER' || user?.is_superuser) && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleImportExcel}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={handleOpenImport}
              >
                Import Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                onClick={handleExportExcel}
              >
                Export Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                New Assessment
              </Button>
            </>
          )}
        </Stack>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Event #, Location, Process..."
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Site</InputLabel>
            <Select value={filterSite} label="Site" onChange={(e) => setFilterSite(e.target.value)}>
              <MenuItem value="ALL">All Sites</MenuItem>
              {sites.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select value={filterCategory} label="Category" onChange={(e) => setFilterCategory(e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="SAFETY">Safety</MenuItem>
              <MenuItem value="HEALTH">Health</MenuItem>
              <MenuItem value="ENVIRONMENTAL">Environmental</MenuItem>
              <MenuItem value="SECURITY">Security</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Risk Level</InputLabel>
            <Select value={filterRiskLevel} label="Risk Level" onChange={(e) => setFilterRiskLevel(e.target.value)}>
              <MenuItem value="ALL">All Levels</MenuItem>
              <MenuItem value="LOW">Low (1-5)</MenuItem>
              <MenuItem value="MEDIUM">Medium (6-12)</MenuItem>
              <MenuItem value="HIGH">High (15-25)</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ flex: 1 }} />
          
        </Stack>
      </Paper>
      
      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        {loading && <LinearProgress />}
        
        <Table stickyHeader sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'event_number'}
                  direction={orderBy === 'event_number' ? order : 'asc'}
                  onClick={() => handleSort('event_number')}
                >
                  Event #
                </TableSortLabel>
              </TableCell>
              <TableCell>Site / Location</TableCell>
              {visibleColumns.assessmentDate && <TableCell>Assessment Date</TableCell>}
              {visibleColumns.category && <TableCell>Category</TableCell>}
              {visibleColumns.activity && <TableCell>Activity</TableCell>}
              {visibleColumns.initialRisk && <TableCell align="center">Initial Risk</TableCell>}
              {visibleColumns.residualRisk && <TableCell align="center">Residual Risk</TableCell>}
              {visibleColumns.assessedBy && <TableCell>Assessed By</TableCell>}
              {visibleColumns.riskOwner && <TableCell>Risk Owner</TableCell>}
              {visibleColumns.status && <TableCell>Status</TableCell>}
              {visibleColumns.nextReview && <TableCell>Next Review</TableCell>}
              {visibleColumns.hazards && <TableCell align="center">Hazards</TableCell>}
              {visibleColumns.barriers && <TableCell align="center">Barriers</TableCell>}
              {visibleColumns.acceptable && <TableCell align="center">Acceptable</TableCell>}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {filteredAndSorted
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((assessment, index) => (
                <TableRow
                  key={assessment.id}
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.grey[500], 0.02),
                  }}
                >
                  <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {assessment.event_number}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {assessment.location}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assessment.process_area}
                    </Typography>
                  </TableCell>
                  
                  {visibleColumns.assessmentDate && (
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.assessment_date}
                    </Typography>
                  </TableCell>
                  )}

                  {visibleColumns.category && (
                  <TableCell>
                    <Chip
                      label={assessment.risk_category.replace('_', ' ')}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  )}
                  
                  {visibleColumns.activity && (
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.activity_type || '—'}
                    </Typography>
                  </TableCell>
                  )}

                  {visibleColumns.initialRisk && (
                  <TableCell align="center">
                    <Chip
                      label={`${assessment.initial_risk_level} - ${assessment.initial_risk_rating}`}
                      size="small"
                      sx={{
                        bgcolor: assessment.initial_risk_color,
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  )}
                  
                  {visibleColumns.residualRisk && (
                  <TableCell align="center">
                    <Chip
                      label={`${assessment.residual_risk_level} - ${assessment.residual_risk_rating}`}
                      size="small"
                      sx={{
                        bgcolor: assessment.residual_risk_color,
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  )}
                  
                  {visibleColumns.assessedBy && (
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.assessed_by_name || '—'}
                    </Typography>
                  </TableCell>
                  )}

                  {visibleColumns.riskOwner && (
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.risk_owner_name || 'Unassigned'}
                    </Typography>
                  </TableCell>
                  )}
                  
                  {visibleColumns.status && (
                  <TableCell>
                    <Chip
                      label={assessment.status.replace('_', ' ')}
                      size="small"
                      color={assessment.status === 'APPROVED' ? 'success' : assessment.status === 'DRAFT' ? 'default' : 'info'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                    {assessment.is_overdue_for_review && (
                      <Chip
                        label="Review Due"
                        size="small"
                        color="error"
                        sx={{ ml: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>
                  )}
                  
                  {visibleColumns.nextReview && (
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.next_review_date || 'Not set'}
                    </Typography>
                  </TableCell>
                  )}
                  
                  {visibleColumns.hazards && (
                  <TableCell align="center">
                    <Chip label={assessment.hazard_count} size="small" />
                  </TableCell>
                  )}
                  {visibleColumns.barriers && (
                  <TableCell align="center">
                    <Chip label={assessment.barrier_count} size="small" />
                  </TableCell>
                  )}
                  {visibleColumns.acceptable && (
                  <TableCell align="center">
                    <Chip
                      label={assessment.risk_acceptable ? 'Yes' : 'No'}
                      color={assessment.risk_acceptable ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  )}

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setEditingAssessment(assessment);
                            setFormDialog(true);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Admin/HSSE Manager only actions */}
                      {(user?.position === 'HSSE MANAGER' || user?.is_superuser) && (
                        <>
                          {assessment.status === 'UNDER_REVIEW' && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(assessment.id)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(assessment.id, assessment.event_number)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredAndSorted.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      
      {/* Risk Assessment Form Dialog */}
      <RiskAssessmentForm
        open={formDialog}
        onClose={() => {
          setFormDialog(false);
          setEditingAssessment(null);
        }}
        onSuccess={() => {
          setFormDialog(false);
          setEditingAssessment(null);
          fetchAssessments();
          showSnackbar('Risk assessment saved successfully', 'success');
        }}
        editingAssessment={editingAssessment}
      />
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(RiskRegister);

