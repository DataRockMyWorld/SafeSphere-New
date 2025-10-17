import React, { useState, useEffect } from 'react';
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
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Badge,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  Checkbox,
} from '@mui/material';
import {
  Assignment as CAPAIcon,
  Visibility as ViewIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
  Send as SendIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import QuickCAPAAssignment from './QuickCAPAAssignment';

interface Finding {
  id: string;
  finding_code: string;
  title: string;
  finding_type: string;
  severity: string;
  status: string;
  department_affected: string;
  identified_date: string;
  audit_date: string;
  iso_clause_number: string;
  audit_code: string;
  audit_type_name: string;
  has_capa: boolean;
  capa_count: number;
  requires_immediate_action: boolean;
}

const ManagementReview: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // CAPA assignment
  const [capaDialogOpen, setCAPADialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [bulkAssignment, setBulkAssignment] = useState(false);
  
  useEffect(() => {
    fetchFindings();
  }, [filterStatus, filterSeverity, filterType]);
  
  const fetchFindings = async () => {
    try {
      setLoading(true);
      let url = '/audits/findings/';
      const params = new URLSearchParams();
      
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (filterSeverity !== 'ALL') params.append('severity', filterSeverity);
      if (filterType !== 'ALL') params.append('finding_type', filterType);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axiosInstance.get(url);
      setFindings(response.data);
    } catch (error) {
      console.error('Error fetching findings:', error);
      showSnackbar('Failed to load findings', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleSelectFinding = (findingId: string) => {
    if (selectedFindings.includes(findingId)) {
      setSelectedFindings(selectedFindings.filter(id => id !== findingId));
    } else {
      setSelectedFindings([...selectedFindings, findingId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedFindings.length === findings.length) {
      setSelectedFindings([]);
    } else {
      setSelectedFindings(findings.map(f => f.id));
    }
  };
  
  const handleAssignCAPA = (finding: Finding) => {
    setSelectedFinding(finding);
    setBulkAssignment(false);
    setCAPADialogOpen(true);
  };
  
  const handleBulkAssign = () => {
    if (selectedFindings.length === 0) {
      showSnackbar('Please select at least one finding', 'error');
      return;
    }
    setBulkAssignment(true);
    setCAPADialogOpen(true);
  };
  
  const handleCAPASuccess = () => {
    fetchFindings();
    setSelectedFindings([]);
    showSnackbar('CAPA(s) assigned successfully', 'success');
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return theme.palette.error.dark;
      case 'HIGH':
        return theme.palette.error.main;
      case 'MEDIUM':
        return theme.palette.warning.main;
      case 'LOW':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getFindingTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR_NC':
        return theme.palette.error.main;
      case 'MINOR_NC':
        return theme.palette.warning.main;
      case 'OBSERVATION':
        return theme.palette.info.main;
      case 'OPPORTUNITY':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getFindingTypeIcon = (type: string) => {
    switch (type) {
      case 'MAJOR_NC':
        return <ErrorIcon fontSize="small" />;
      case 'MINOR_NC':
        return <WarningIcon fontSize="small" />;
      case 'OBSERVATION':
        return <InfoIcon fontSize="small" />;
      case 'OPPORTUNITY':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  const needsCAPA = (finding: Finding) => {
    return ['MAJOR_NC', 'MINOR_NC'].includes(finding.finding_type) && !finding.has_capa;
  };
  
  const findingsNeedingCAPA = findings.filter(needsCAPA);
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
            Management Review
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Review findings and assign corrective actions
          </Typography>
        </Box>
        
        {user?.position === 'HSSE MANAGER' && selectedFindings.length > 0 && (
          <Button
            variant="contained"
            startIcon={<CAPAIcon />}
            onClick={handleBulkAssign}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Assign CAPA to Selected ({selectedFindings.length})
          </Button>
        )}
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.error.main}` }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                {findings.filter(f => f.finding_type === 'MAJOR_NC').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Major NCs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                {findings.filter(f => f.finding_type === 'MINOR_NC').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Minor NCs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.info.main}` }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                {findingsNeedingCAPA.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need CAPA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                {findings.filter(f => f.has_capa).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CAPA Assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FilterIcon color="action" />
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="CAPA_ASSIGNED">CAPA Assigned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="PENDING_VERIFICATION">Pending Verification</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Severity</InputLabel>
            <Select
              value={filterSeverity}
              label="Severity"
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <MenuItem value="ALL">All Severities</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="MAJOR_NC">Major NC</MenuItem>
              <MenuItem value="MINOR_NC">Minor NC</MenuItem>
              <MenuItem value="OBSERVATION">Observation</MenuItem>
              <MenuItem value="OPPORTUNITY">Opportunity</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ flex: 1 }} />
          
          <Typography variant="body2" color="text.secondary">
            {findings.length} findings | {findingsNeedingCAPA.length} need CAPA
          </Typography>
        </Stack>
      </Paper>
      
      {/* Findings Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}` }}>
        {loading && <LinearProgress />}
        
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              {user?.position === 'HSSE MANAGER' && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedFindings.length === findings.length && findings.length > 0}
                    indeterminate={selectedFindings.length > 0 && selectedFindings.length < findings.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700 }}>Finding Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Audit</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">CAPA</TableCell>
              {user?.position === 'HSSE MANAGER' && (
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {findings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No findings match your filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              findings.map((finding, index) => (
                <TableRow
                  key={finding.id}
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.grey[500], 0.02),
                  }}
                >
                  {user?.position === 'HSSE MANAGER' && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedFindings.includes(finding.id)}
                        onChange={() => handleSelectFinding(finding.id)}
                        disabled={finding.has_capa}
                      />
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {finding.finding_code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {finding.audit_date || finding.identified_date}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {finding.title}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getFindingTypeIcon(finding.finding_type)}
                      label={finding.finding_type.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: alpha(getFindingTypeColor(finding.finding_type), 0.1),
                        color: getFindingTypeColor(finding.finding_type),
                        fontWeight: 600,
                        border: `1px solid ${alpha(getFindingTypeColor(finding.finding_type), 0.3)}`,
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={finding.severity}
                      size="small"
                      sx={{
                        bgcolor: alpha(getSeverityColor(finding.severity), 0.1),
                        color: getSeverityColor(finding.severity),
                        fontWeight: 600,
                      }}
                    />
                    {finding.requires_immediate_action && (
                      <Chip
                        label="URGENT"
                        size="small"
                        color="error"
                        sx={{ ml: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {finding.department_affected}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {finding.audit_code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {finding.audit_type_name}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={finding.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: finding.status === 'OPEN' 
                          ? alpha(theme.palette.warning.main, 0.1)
                          : finding.status === 'CLOSED'
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.info.main, 0.1),
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    {finding.has_capa ? (
                      <Badge badgeContent={finding.capa_count} color="success">
                        <CheckCircleIcon color="success" />
                      </Badge>
                    ) : needsCAPA(finding) ? (
                      <Tooltip title="Needs CAPA Assignment">
                        <ErrorIcon color="error" />
                      </Tooltip>
                    ) : (
                      <Chip label="N/A" size="small" />
                    )}
                  </TableCell>
                  
                  {user?.position === 'HSSE MANAGER' && (
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {needsCAPA(finding) && (
                          <Tooltip title="Assign CAPA">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAssignCAPA(finding)}
                            >
                              <CAPAIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Recommendations */}
      {findingsNeedingCAPA.length > 0 && user?.position === 'HSSE MANAGER' && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {findingsNeedingCAPA.length} finding(s) require CAPA assignment
          </Typography>
          <Typography variant="caption">
            Major and Minor Non-Conformities must have corrective actions assigned.
            Select findings and click "Assign CAPA" to proceed.
          </Typography>
        </Alert>
      )}
      
      {/* Quick CAPA Assignment Dialog */}
      <QuickCAPAAssignment
        open={capaDialogOpen}
        onClose={() => {
          setCAPADialogOpen(false);
          setSelectedFinding(null);
        }}
        onSuccess={handleCAPASuccess}
        finding={selectedFinding}
        findingIds={bulkAssignment ? selectedFindings : undefined}
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

export default ManagementReview;

