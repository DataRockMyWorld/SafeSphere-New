import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  InputAdornment,
  Menu,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Group as TeamIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface ISOClause {
  id: number;
  clause_number: string;
  title: string;
  risk_category: string;
}

interface AuditType {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

interface AuditPlan {
  id: string;
  audit_code: string;
  title: string;
  audit_type: number;
  audit_type_name: string;
  status: string;
  planned_start_date: string;
  planned_end_date: string;
  lead_auditor_name: string;
  iso_clause_count: number;
  is_overdue: boolean;
  days_until_start: number;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof AuditPlan;

const AuditPlanner: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditPlan[]>([]);
  const [isoClauses, setIsoClauses] = useState<ISOClause[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditTypes, setAuditTypes] = useState<AuditType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAudit, setEditingAudit] = useState<AuditPlan | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Table state
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('planned_start_date');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditPlan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    audit_type_id: '' as string | number,
    scope_description: '',
    departments: [] as string[],
    processes: [] as string[],
    locations: [] as string[],
    planned_start_date: null as Date | null,
    planned_end_date: null as Date | null,
    lead_auditor_id: '',
    audit_team_ids: [] as number[],
    iso_clause_ids: [] as number[],
    objectives: [] as string[],
    audit_criteria: '',
  });
  
  const [newObjective, setNewObjective] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newProcess, setNewProcess] = useState('');
  const [newLocation, setNewLocation] = useState('');
  
  // Email notification dialog
  const [emailDialog, setEmailDialog] = useState(false);
  const [selectedAuditForEmail, setSelectedAuditForEmail] = useState<AuditPlan | null>(null);
  const [emailRecipients, setEmailRecipients] = useState<number[]>([]);
  const [additionalMessage, setAdditionalMessage] = useState('');
  
  const departmentOptions = ['OPERATIONS', 'MARKETING', 'HSSE', 'FINANCE'];
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [auditsRes, clausesRes, usersRes, typesRes] = await Promise.all([
        axiosInstance.get('/audits/plans/'),
        axiosInstance.get('/audits/iso-clauses/'),
        axiosInstance.get('/users/'),
        axiosInstance.get('/audits/types/'),
      ]);
      
      setAudits(auditsRes.data);
      setIsoClauses(clausesRes.data);
      setUsers(usersRes.data);
      setAuditTypes(typesRes.data);
    } catch (error) {
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleOpenDialog = (audit: AuditPlan | null = null) => {
    if (audit) {
      setEditingAudit(audit);
      // Populate form with audit data for editing
      // Note: You'd need to fetch full audit details here
    } else {
      setEditingAudit(null);
      setFormData({
        title: '',
        audit_type_id: auditTypes.length > 0 ? auditTypes[0].id : '',
        scope_description: '',
        departments: [],
        processes: [],
        locations: [],
        planned_start_date: null,
        planned_end_date: null,
        lead_auditor_id: '',
        audit_team_ids: [],
        iso_clause_ids: [],
        objectives: [],
        audit_criteria: '',
      });
    }
    setOpenDialog(true);
  };
  
  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.audit_type_id || !formData.planned_start_date || !formData.planned_end_date) {
        showSnackbar('Please fill in all required fields (Title, Audit Type, Dates)', 'error');
        return;
      }
      
      if (formData.iso_clause_ids.length === 0) {
        showSnackbar('Please select at least one ISO clause', 'error');
        return;
      }
      
      const payload: any = {
        title: formData.title,
        audit_type_id: formData.audit_type_id || undefined,
        scope_description: formData.scope_description || '',
        departments: formData.departments.length > 0 ? formData.departments : [],
        processes: formData.processes.length > 0 ? formData.processes : [],
        locations: formData.locations.length > 0 ? formData.locations : [],
        planned_start_date: formData.planned_start_date?.toISOString().split('T')[0],
        planned_end_date: formData.planned_end_date?.toISOString().split('T')[0],
        audit_team_ids: formData.audit_team_ids.length > 0 ? formData.audit_team_ids : [],
        iso_clause_ids: formData.iso_clause_ids,
        objectives: formData.objectives.length > 0 ? formData.objectives : [],
        methodology: {},
        audit_criteria: formData.audit_criteria || '',
      };
      
      // Only include lead_auditor_id if it has a value
      if (formData.lead_auditor_id) {
        payload.lead_auditor_id = formData.lead_auditor_id;
      }
      
      // Debug: Log the payload
      console.log('Sending audit plan payload:', JSON.stringify(payload, null, 2));
      
      if (editingAudit) {
        await axiosInstance.put(`/audits/plans/${editingAudit.id}/`, payload);
        showSnackbar('Audit plan updated successfully', 'success');
      } else {
        await axiosInstance.post('/audits/plans/', payload);
        showSnackbar('Audit plan created successfully', 'success');
      }
      
      setOpenDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving audit:', error);
      console.error('Error response data:', error.response?.data);
      
      // Handle DRF validation errors
      let errorMessage = 'Failed to save audit plan';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          // DRF validation errors
          const errors = Object.entries(error.response.data)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          errorMessage = errors || errorMessage;
        }
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this audit plan?')) return;
    
    try {
      await axiosInstance.delete(`/audits/plans/${id}/`);
      showSnackbar('Audit plan deleted successfully', 'success');
      fetchData();
    } catch (error) {
      showSnackbar('Failed to delete audit plan', 'error');
    }
  };
  
  const handleOpenEmailDialog = (audit: AuditPlan) => {
    setSelectedAuditForEmail(audit);
    setEmailRecipients([]);
    setAdditionalMessage('');
    setEmailDialog(true);
  };
  
  const handleSendEmail = async () => {
    if (!selectedAuditForEmail) return;
    
    try {
      const payload: any = {};
      
      if (emailRecipients.length > 0) {
        payload.recipient_user_ids = emailRecipients;
      }
      
      if (additionalMessage.trim()) {
        payload.additional_message = additionalMessage.trim();
      }
      
      await axiosInstance.post(`/audits/plans/${selectedAuditForEmail.id}/send-notification/`, payload);
      
      showSnackbar('Audit plan notification sent successfully', 'success');
      setEmailDialog(false);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      showSnackbar(error.response?.data?.error || 'Failed to send notification', 'error');
    }
  };
  
  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData({ ...formData, objectives: [...formData.objectives, newObjective.trim()] });
      setNewObjective('');
    }
  };
  
  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter((_, i) => i !== index)
    });
  };
  
  // Table sorting
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Filtering and sorting
  const filteredAndSortedAudits = useMemo(() => {
    let filtered = audits.filter(audit => {
      const matchesSearch = 
        audit.audit_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.lead_auditor_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || audit.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort
    filtered.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [audits, searchQuery, statusFilter, order, orderBy]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return theme.palette.success.main;
      case 'IN_PROGRESS':
        return theme.palette.info.main;
      case 'SCHEDULED':
        return theme.palette.warning.main;
      case 'CANCELLED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon fontSize="small" />;
      case 'IN_PROGRESS':
        return <ScheduleIcon fontSize="small" />;
      case 'SCHEDULED':
        return <CalendarIcon fontSize="small" />;
      case 'CANCELLED':
        return <WarningIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, audit: AuditPlan) => {
    setAnchorEl(event.currentTarget);
    setSelectedAudit(audit);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAudit(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
              Audit Planning
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Plan and manage ISO 45001:2018 internal audits
            </Typography>
          </Box>
          
          {user?.position === 'HSSE MANAGER' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              Create Audit Plan
            </Button>
          )}
        </Box>
        
        {/* Filters */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search audits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
              size="small"
            />
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                startAdornment={<FilterIcon fontSize="small" sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredAndSortedAudits.length} of {audits.length} audit plans
            </Typography>
          </Box>
        </Paper>
        
        {/* Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
            overflow: 'hidden',
          }}
        >
          {loading && <LinearProgress />}
          
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 2 }}>
                  <TableSortLabel
                    active={orderBy === 'audit_code'}
                    direction={orderBy === 'audit_code' ? order : 'asc'}
                    onClick={() => handleRequestSort('audit_code')}
                  >
                    Audit Code
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleRequestSort('title')}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={orderBy === 'planned_start_date'}
                    direction={orderBy === 'planned_start_date' ? order : 'asc'}
                    onClick={() => handleRequestSort('planned_start_date')}
                  >
                    Start Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Lead Auditor</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Clauses</TableCell>
                {user?.position === 'HSSE MANAGER' && (
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            
            <TableBody>
              {filteredAndSortedAudits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery || statusFilter !== 'ALL' 
                        ? 'No audits match your filters'
                        : 'No audit plans yet. Create your first audit plan to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedAudits.map((audit, index) => (
                  <TableRow
                    key={audit.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                      bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.grey[500], 0.02),
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {audit.audit_code}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {audit.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {audit.audit_type_name}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(audit.status)}
                        label={audit.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(audit.status), 0.1),
                          color: getStatusColor(audit.status),
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${alpha(getStatusColor(audit.status), 0.3)}`,
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarIcon fontSize="small" sx={{ color: 'action.active', fontSize: 16 }} />
                        <Typography variant="body2">
                          {new Date(audit.planned_start_date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      {audit.is_overdue && (
                        <Chip
                          label="Overdue"
                          size="small"
                          color="error"
                          sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(audit.planned_end_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <TeamIcon fontSize="small" sx={{ color: 'action.active', fontSize: 16 }} />
                        <Typography variant="body2">
                          {audit.lead_auditor_name || 'Not assigned'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={audit.iso_clause_count}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    
                    {user?.position === 'HSSE MANAGER' && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Send Email">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEmailDialog(audit)}
                              sx={{
                                color: theme.palette.info.main,
                                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                              }}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(audit)}
                              sx={{
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(audit.id)}
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingAudit ? 'Edit Audit Plan' : 'Create New Audit Plan'}
            </Typography>
          </DialogTitle>
          
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Basic Information */}
              <TextField
                fullWidth
                label="Audit Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              
              <FormControl fullWidth required>
                <InputLabel>Audit Type</InputLabel>
                <Select
                  value={formData.audit_type_id}
                  label="Audit Type"
                  onChange={(e) => setFormData({ ...formData, audit_type_id: e.target.value })}
                >
                  {auditTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Scope Description"
                value={formData.scope_description}
                onChange={(e) => setFormData({ ...formData, scope_description: e.target.value })}
              />
              
              {/* Dates */}
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={formData.planned_start_date}
                  onChange={(date) => setFormData({ ...formData, planned_start_date: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <DatePicker
                  label="End Date"
                  value={formData.planned_end_date}
                  onChange={(date) => setFormData({ ...formData, planned_end_date: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Stack>
              
              {/* Team */}
              <Autocomplete
                options={users.filter(u => u.position === 'HSSE MANAGER')}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                value={users.find(u => u.id === Number(formData.lead_auditor_id)) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, lead_auditor_id: newValue ? String(newValue.id) : '' });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Lead Auditor" />
                )}
              />
              
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.position})`}
                value={users.filter(u => formData.audit_team_ids.includes(u.id))}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, audit_team_ids: newValue.map(v => v.id) });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Audit Team" />
                )}
              />
              
              {/* ISO Clauses */}
              <Autocomplete
                multiple
                options={isoClauses}
                getOptionLabel={(option) => `${option.clause_number} - ${option.title}`}
                value={isoClauses.filter(c => formData.iso_clause_ids.includes(c.id))}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, iso_clause_ids: newValue.map(v => v.id) });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="ISO 45001 Clauses" required />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.clause_number}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />
              
              {/* Departments */}
              <Autocomplete
                multiple
                freeSolo
                options={departmentOptions}
                value={formData.departments}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, departments: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Departments" placeholder="Add departments..." />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} size="small" />
                  ))
                }
              />
              
              {/* Objectives */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Audit Objectives</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add an objective..."
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addObjective();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={addObjective}>Add</Button>
                </Stack>
                <List dense>
                  {formData.objectives.map((obj, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" size="small" onClick={() => removeObjective(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={obj} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingAudit ? 'Update' : 'Create'} Audit Plan
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Email Dialog */}
        <Dialog
          open={emailDialog}
          onClose={() => setEmailDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon color="primary" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Send Audit Plan Notification
                </Typography>
                {selectedAuditForEmail && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedAuditForEmail.audit_code}: {selectedAuditForEmail.title}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            <Stack spacing={3}>
              <Alert severity="info">
                By default, this notification will be sent to the lead auditor and all team members.
                You can optionally select additional recipients below.
              </Alert>
              
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                value={users.filter(u => emailRecipients.includes(u.id))}
                onChange={(_, newValue) => {
                  setEmailRecipients(newValue.map(v => v.id));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Additional Recipients (Optional)"
                    placeholder="Select users..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.first_name} ${option.last_name}`}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Message (Optional)"
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                placeholder="Add any special instructions or requirements for the audit..."
                helperText="This message will be included in the email notification"
              />
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSendEmail}
              color="primary"
            >
              Send Notification
            </Button>
          </DialogActions>
        </Dialog>
        
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
    </LocalizationProvider>
  );
};

export default AuditPlanner;
