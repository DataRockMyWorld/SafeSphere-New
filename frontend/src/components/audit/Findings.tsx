import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  AssignmentTurnedIn as CAPAIcon,
  AttachFile as AttachFileIcon,
  FilterList as FilterIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import FindingCreationForm from './FindingCreationForm';
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
  iso_clause_number: string;
  audit_code: string;
  has_capa: boolean;
  all_capas_closed: boolean;
  capa_count: number;
  requires_immediate_action: boolean;
}

interface FindingDetail extends Finding {
  description: string;
  root_cause_analysis: any;
  impact_assessment: string;
  risk_level: number;
  process_affected: string;
  location: string;
  evidence_files: any[];
  capas: any[];
}

const Findings: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFinding, setSelectedFinding] = useState<FindingDetail | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [capaDialog, setCAPADialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  
  useEffect(() => {
    fetchFindings();
  }, [filterType, filterStatus, filterSeverity]);
  
  const fetchFindings = async () => {
    try {
      setLoading(true);
      let url = '/audits/findings/';
      const params = new URLSearchParams();
      
      if (filterType !== 'ALL') params.append('finding_type', filterType);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (filterSeverity !== 'ALL') params.append('severity', filterSeverity);
      
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
  
  const handleAssignCAPA = () => {
    setCAPADialog(true);
  };
  
  const handleCAPASuccess = () => {
    setCAPADialog(false);
    fetchFindings();
    if (selectedFinding) {
      handleViewDetails(selectedFinding.id);
    }
    showSnackbar('CAPA assigned successfully', 'success');
  };
  
  const downloadPDF = async (findingId: string, findingCode: string) => {
    try {
      const response = await axiosInstance.get(`/audits/findings/${findingId}/pdf-report/`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Audit_Finding_${findingCode}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('PDF report downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showSnackbar('Failed to download PDF report', 'error');
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
        return <ErrorIcon />;
      case 'MINOR_NC':
        return <WarningIcon />;
      case 'OBSERVATION':
        return <InfoIcon />;
      case 'OPPORTUNITY':
        return <CheckCircleIcon />;
      default:
        return <InfoIcon />;
    }
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED':
      case 'VERIFIED':
        return theme.palette.success.main;
      case 'IN_PROGRESS':
      case 'PENDING_VERIFICATION':
        return theme.palette.info.main;
      case 'CAPA_ASSIGNED':
        return theme.palette.warning.main;
      case 'OPEN':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const viewFindingDetail = async (finding: Finding) => {
    try {
      const response = await axiosInstance.get(`/audits/findings/${finding.id}/`);
      setSelectedFinding(response.data);
      setDetailDialog(true);
    } catch (error) {
      showSnackbar('Failed to load finding details', 'error');
    }
  };
  
  const filteredFindings = findings;
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Audit Findings & Non-Conformities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage audit findings, observations, and improvement opportunities
          </Typography>
        </Box>
        {user?.position === 'HSSE MANAGER' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            Log Finding
          </Button>
        )}
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
              {findings.filter(f => f.finding_type === 'MAJOR_NC').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Major NCs
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
              {findings.filter(f => f.finding_type === 'MINOR_NC').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Minor NCs
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
              {findings.filter(f => f.finding_type === 'OBSERVATION').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Observations
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
              {findings.filter(f => !f.all_capas_closed).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open Findings
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterIcon color="action" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="MAJOR_NC">Major NC</MenuItem>
                <MenuItem value="MINOR_NC">Minor NC</MenuItem>
                <MenuItem value="OBSERVATION">Observation</MenuItem>
                <MenuItem value="OPPORTUNITY">Opportunity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select value={filterSeverity} label="Severity" onChange={(e) => setFilterSeverity(e.target.value)}>
                <MenuItem value="ALL">All Severities</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="CAPA_ASSIGNED">CAPA Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm>
            <Button variant="outlined" size="small" onClick={() => {
              setFilterType('ALL');
              setFilterStatus('ALL');
              setFilterSeverity('ALL');
            }}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Findings Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 700 }}>Finding Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ISO Clause</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CAPAs</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFindings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((finding) => (
                <TableRow
                  key={finding.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    bgcolor: finding.requires_immediate_action ? alpha(theme.palette.error.main, 0.05) : 'inherit',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {finding.finding_code}
                      </Typography>
                      {finding.requires_immediate_action && (
                        <Tooltip title="Requires Immediate Action">
                          <ErrorIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }}>
                      {finding.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Audit: {finding.audit_code}
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
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={finding.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(finding.status), 0.1),
                        color: getStatusColor(finding.status),
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {finding.iso_clause_number}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">{finding.department_affected}</Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Badge badgeContent={finding.capa_count} color="primary">
                      <CAPAIcon color="action" />
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => viewFindingDetail(finding)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF Report">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => downloadPDF(finding.id, finding.finding_code)}
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user?.position === 'HSSE MANAGER' && (
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        
        {filteredFindings.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: alpha(theme.palette.success.main, 0.3), mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No findings found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterType !== 'ALL' || filterStatus !== 'ALL' || filterSeverity !== 'ALL'
                ? 'Try adjusting your filters'
                : 'All clear! No findings to display.'}
            </Typography>
          </Box>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredFindings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      
      {/* Finding Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedFinding && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getFindingTypeIcon(selectedFinding.finding_type)}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedFinding.finding_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFinding.title}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Status Chips */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      icon={getFindingTypeIcon(selectedFinding.finding_type)}
                      label={selectedFinding.finding_type.replace('_', ' ')}
                      sx={{
                        bgcolor: alpha(getFindingTypeColor(selectedFinding.finding_type), 0.1),
                        color: getFindingTypeColor(selectedFinding.finding_type),
                      }}
                    />
                    <Chip
                      label={selectedFinding.severity}
                      sx={{
                        bgcolor: alpha(getSeverityColor(selectedFinding.severity), 0.1),
                        color: getSeverityColor(selectedFinding.severity),
                      }}
                    />
                    <Chip
                      label={selectedFinding.status.replace('_', ' ')}
                      sx={{
                        bgcolor: alpha(getStatusColor(selectedFinding.status), 0.1),
                        color: getStatusColor(selectedFinding.status),
                      }}
                    />
                    {selectedFinding.requires_immediate_action && (
                      <Chip
                        icon={<ErrorIcon />}
                        label="IMMEDIATE ACTION REQUIRED"
                        color="error"
                      />
                    )}
                  </Stack>
                </Grid>
                
                {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedFinding.description}
                  </Typography>
                </Grid>
                
                {/* Details */}
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    ISO Clause
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedFinding.iso_clause_number}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Risk Level
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedFinding.risk_level}/10
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedFinding.department_affected}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Impact
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedFinding.impact_assessment}
                  </Typography>
                </Grid>
                
                {/* Root Cause */}
                {selectedFinding.root_cause_analysis && Object.keys(selectedFinding.root_cause_analysis).length > 0 && (
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Root Cause Analysis
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <pre style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(selectedFinding.root_cause_analysis, null, 2)}
                        </pre>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
                
                {/* Evidence */}
                {selectedFinding.evidence_files && selectedFinding.evidence_files.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Evidence ({selectedFinding.evidence_files.length})
                    </Typography>
                    <List dense>
                      {selectedFinding.evidence_files.map((evidence: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={evidence.title}
                            secondary={`${evidence.file_type} - ${evidence.file_size_mb} MB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {/* CAPAs */}
                {selectedFinding.capas && selectedFinding.capas.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Assigned CAPAs ({selectedFinding.capas.length})
                    </Typography>
                    <List dense>
                      {selectedFinding.capas.map((capa: any) => (
                        <ListItem key={capa.id}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {capa.action_code}
                                </Typography>
                                <Chip
                                  label={capa.status}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            }
                            secondary={capa.title}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDetailDialog(false)}>Close</Button>
              {user?.position === 'HSSE MANAGER' && !selectedFinding.has_capa && (
                <Button 
                  variant="contained" 
                  startIcon={<CAPAIcon />}
                  onClick={handleAssignCAPA}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                  }}
                >
                  Assign CAPA
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Create Finding Dialog */}
      <FindingCreationForm
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        onSuccess={() => {
          fetchFindings();
          showSnackbar('Finding created successfully', 'success');
        }}
      />
      
      {/* Quick CAPA Assignment Dialog */}
      {selectedFinding && (
        <QuickCAPAAssignment
          open={capaDialog}
          onClose={() => setCAPADialog(false)}
          onSuccess={handleCAPASuccess}
          finding={{
            id: selectedFinding.id,
            finding_code: selectedFinding.finding_code,
            title: selectedFinding.title,
            finding_type: selectedFinding.finding_type,
            severity: selectedFinding.severity,
            description: selectedFinding.description,
            root_cause_analysis: selectedFinding.root_cause_analysis,
            department_affected: selectedFinding.department_affected,
          }}
        />
      )}
      
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

export default Findings;

