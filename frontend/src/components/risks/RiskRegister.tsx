import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import RiskAssessmentForm from './RiskAssessmentForm';

interface RiskAssessment {
  id: string;
  event_number: string;
  status: string;
  location: string;
  process_area: string;
  risk_category: string;
  activity_type: string;
  assessed_by_name: string;
  risk_owner_name: string;
  assessment_date: string;
  next_review_date: string;
  initial_risk_level: number;
  residual_risk_level: number;
  initial_risk_rating: string;
  residual_risk_rating: string;
  initial_risk_color: string;
  residual_risk_color: string;
  risk_acceptable: boolean;
  is_overdue_for_review: boolean;
  hazard_count: number;
  barrier_count: number;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  useEffect(() => {
    fetchAssessments();
  }, []);
  
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/risks/assessments/');
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      showSnackbar('Failed to load risk assessments', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleExportExcel = async () => {
    try {
      const response = await axiosInstance.get('/risks/export-excel/', {
        responseType: 'blob',
        params: {
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
          category: filterCategory !== 'ALL' ? filterCategory : undefined,
        },
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
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
  };
  
  const handleSort = (property: keyof RiskAssessment) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleDelete = async (id: string, eventNumber: string) => {
    if (!window.confirm(`Delete risk assessment ${eventNumber}?`)) return;
    
    try {
      await axiosInstance.delete(`/risks/assessments/${id}/`);
      showSnackbar('Risk assessment deleted', 'success');
      fetchAssessments();
    } catch (error) {
      showSnackbar('Failed to delete', 'error');
    }
  };
  
  const handleApprove = async (id: string) => {
    try {
      await axiosInstance.post(`/risks/assessments/${id}/approve/`);
      showSnackbar('Risk assessment approved', 'success');
      fetchAssessments();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to approve', 'error');
    }
  };
  
  const openCreateDialog = () => {
    setEditingAssessment(null);
    setFormDialog(true);
  };
  
  // Filter and sort data
  const filteredAndSorted = React.useMemo(() => {
    let filtered = assessments.filter(assessment => {
      if (filterStatus !== 'ALL' && assessment.status !== filterStatus) return false;
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
  }, [assessments, filterStatus, filterCategory, filterRiskLevel, searchTerm, orderBy, order]);
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Risk Register
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive risk assessment table with Excel export
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
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
          
          <Typography variant="body2" color="text.secondary">
            Showing {filteredAndSorted.length} of {assessments.length} assessments
          </Typography>
        </Stack>
      </Paper>
      
      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading && <LinearProgress />}
        
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'event_number'}
                  direction={orderBy === 'event_number' ? order : 'asc'}
                  onClick={() => handleSort('event_number')}
                >
                  Event #
                </TableSortLabel>
              </TableCell>
              <TableCell>Location / Process</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Initial Risk</TableCell>
              <TableCell align="center">Residual Risk</TableCell>
              <TableCell>Risk Owner</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Next Review</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {assessment.event_number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assessment.assessment_date}
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
                  
                  <TableCell>
                    <Chip
                      label={assessment.risk_category.replace('_', ' ')}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  
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
                  
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.risk_owner_name || 'Unassigned'}
                    </Typography>
                  </TableCell>
                  
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
                  
                  <TableCell>
                    <Typography variant="body2">
                      {assessment.next_review_date || 'Not set'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {user?.position === 'HSSE MANAGER' && assessment.status === 'UNDER_REVIEW' && (
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

export default RiskRegister;

