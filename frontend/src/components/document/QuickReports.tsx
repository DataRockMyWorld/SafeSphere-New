import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  useTheme,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as AccidentIcon,
  ReportProblem as NearMissIcon,
  ErrorOutline as PotentialIcon,
  Cancel as NonConformityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface QuickReport {
  id: string;
  report_number: string;
  report_type: 'ACCIDENT' | 'NEAR_MISS' | 'POTENTIAL_INCIDENT' | 'NON_CONFORMITY';
  title: string;
  description: string;
  location: string;
  incident_date: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  persons_involved?: string;
  witnesses?: string;
  immediate_actions_taken?: string;
  contributing_factors?: string;
  photo_evidence?: string;
  photo_evidence_url?: string;
  additional_document?: string;
  additional_document_url?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reported_by: {
    id: number;
    email: string;
    full_name: string;
  };
  reviewed_by?: {
    id: number;
    email: string;
    full_name: string;
  };
  reviewed_at?: string;
  review_comments?: string;
  rejection_reason?: string;
  created_at: string;
  created_record_number?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  by_type: {
    accidents: number;
    near_misses: number;
    potential_incidents: number;
    non_conformities: number;
  };
  by_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const QuickReports: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [reports, setReports] = useState<QuickReport[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'ACCIDENT' | 'NEAR_MISS' | 'POTENTIAL_INCIDENT' | 'NON_CONFORMITY'>('ACCIDENT');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<QuickReport | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    incident_date: '',
    severity: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    persons_involved: '',
    witnesses: '',
    immediate_actions_taken: '',
    contributing_factors: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Review form
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComments, setReviewComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/quick-reports/');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showSnackbar('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/quick-reports/statistics/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);
  
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);
  
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'ACCIDENT': return <AccidentIcon sx={{ color: '#757575', fontSize: 20 }} />;
      case 'NEAR_MISS': return <NearMissIcon sx={{ color: '#757575', fontSize: 20 }} />;
      case 'POTENTIAL_INCIDENT': return <PotentialIcon sx={{ color: '#757575', fontSize: 20 }} />;
      case 'NON_CONFORMITY': return <NonConformityIcon sx={{ color: '#757575', fontSize: 20 }} />;
      default: return null;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { bg: '#FFEBEE', color: '#C62828', label: 'Critical' };
      case 'HIGH': return { bg: '#FFF3E0', color: '#E65100', label: 'High' };
      case 'MEDIUM': return { bg: '#FFF8E1', color: '#F57C00', label: 'Medium' };
      case 'LOW': return { bg: '#F5F5F5', color: '#616161', label: 'Low' };
      default: return { bg: '#F5F5F5', color: '#757575', label: severity };
    }
  };
  
  const getStatusChip = (status: string) => {
    const styles = {
      PENDING: { label: 'Pending', bgcolor: '#FFF8E1', color: '#F57C00' },
      APPROVED: { label: 'Approved', bgcolor: '#E8F5E9', color: '#2E7D32' },
      REJECTED: { label: 'Rejected', bgcolor: '#FFEBEE', color: '#C62828' },
    };
    const style = styles[status as keyof typeof styles] || styles.PENDING;
    return <Chip label={style.label} size="small" sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 500, border: 'none' }} />;
  };
  
  const handleOpenReportDialog = (type: 'ACCIDENT' | 'NEAR_MISS' | 'POTENTIAL_INCIDENT' | 'NON_CONFORMITY') => {
    setSelectedReportType(type);
    setFormData({
      title: '',
      description: '',
      location: '',
      incident_date: '',
      severity: 'LOW',
      persons_involved: '',
      witnesses: '',
      immediate_actions_taken: '',
      contributing_factors: '',
    });
    setPhotoFile(null);
    setDocumentFile(null);
    setReportDialog(true);
  };
  
  const handleSubmitReport = async () => {
    if (!formData.title || !formData.description || !formData.location || !formData.incident_date) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const data = new FormData();
      data.append('report_type', selectedReportType);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('incident_date', new Date(formData.incident_date).toISOString());
      data.append('severity', formData.severity);
      if (formData.persons_involved) data.append('persons_involved', formData.persons_involved);
      if (formData.witnesses) data.append('witnesses', formData.witnesses);
      if (formData.immediate_actions_taken) data.append('immediate_actions_taken', formData.immediate_actions_taken);
      if (formData.contributing_factors) data.append('contributing_factors', formData.contributing_factors);
      if (photoFile) data.append('photo_evidence', photoFile);
      if (documentFile) data.append('additional_document', documentFile);
      
      await axiosInstance.post('/quick-reports/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      showSnackbar('Report submitted successfully', 'success');
      setReportDialog(false);
      fetchReports();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.detail || 'Failed to submit report', 'error');
    }
  };
  
  const handleReview = async () => {
    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      showSnackbar('Rejection reason is required', 'error');
      return;
    }
    
    try {
      await axiosInstance.post(`/quick-reports/${selectedReport?.id}/review/`, {
        action: reviewAction,
        comments: reviewComments,
        rejection_reason: rejectionReason,
      });
      
      showSnackbar(
        reviewAction === 'approve' 
          ? 'Report approved and filed as a record' 
          : 'Report rejected',
        'success'
      );
      setReviewDialog(false);
      setSelectedReport(null);
      setReviewComments('');
      setRejectionReason('');
      fetchReports();
      fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to review report', 'error');
    }
  };
  
  const filteredReports = reports.filter(report => {
    if (selectedTab === 0) return true; // All
    if (selectedTab === 1) return report.status === 'PENDING';
    if (selectedTab === 2) return report.status === 'APPROVED';
    if (selectedTab === 3) return report.status === 'REJECTED';
    return true;
  });
  
  const getReportTypeLabel = (type: string) => {
    const labels = {
      ACCIDENT: 'Accident',
      NEAR_MISS: 'Near Miss',
      POTENTIAL_INCIDENT: 'Potential Incident',
      NON_CONFORMITY: 'Non-Conformity',
    };
    return labels[type as keyof typeof labels] || type;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Quick Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Report accidents, near misses, potential incidents, and non-conformities
          </Typography>
        </Box>
        
        {/* Report Type Selector (Dropdown) */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Submit New Report</InputLabel>
          <Select
            value=""
            label="Submit New Report"
            onChange={(e) => {
              const type = e.target.value as 'ACCIDENT' | 'NEAR_MISS' | 'POTENTIAL_INCIDENT' | 'NON_CONFORMITY';
              if (type) handleOpenReportDialog(type);
            }}
          >
            <MenuItem value="ACCIDENT">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccidentIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Accident
              </Box>
            </MenuItem>
            <MenuItem value="NEAR_MISS">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NearMissIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Near Miss
              </Box>
            </MenuItem>
            <MenuItem value="POTENTIAL_INCIDENT">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PotentialIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Potential Incident
              </Box>
            </MenuItem>
            <MenuItem value="NON_CONFORMITY">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NonConformityIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Non-Conformity
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Filter Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 1 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Reports" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>
      
      {/* Reports Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No reports found. Submit your first report using the dropdown above.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Report #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Incident Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reported By</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => {
                  const severityStyle = getSeverityColor(report.severity);
                  return (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Chip 
                          label={report.report_number} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getReportIcon(report.report_type)}
                          <Typography variant="body2">
                            {getReportTypeLabel(report.report_type)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {report.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{report.location}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.severity}
                          size="small"
                          sx={{
                            bgcolor: severityStyle.bg,
                            color: severityStyle.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(report.status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(report.incident_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{report.reported_by.full_name}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedReport(report);
                                setDetailsDialog(true);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {(user?.position === 'HSSE MANAGER' || user?.is_superuser) && report.status === 'PENDING' && (
                            <Tooltip title="Review">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setReviewDialog(true);
                                }}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
      
      {/* Submit Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getReportIcon(selectedReportType)}
            <Typography variant="h6">
              Report {getReportTypeLabel(selectedReportType)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title / Summary"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the incident"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where did this occur?"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Incident Date & Time"
                required
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  label="Severity"
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of what happened..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Persons Involved (Optional)"
                value={formData.persons_involved}
                onChange={(e) => setFormData({ ...formData, persons_involved: e.target.value })}
                placeholder="Names of people involved"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Witnesses (Optional)"
                value={formData.witnesses}
                onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                placeholder="Names of witnesses"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Immediate Actions Taken (Optional)"
                value={formData.immediate_actions_taken}
                onChange={(e) => setFormData({ ...formData, immediate_actions_taken: e.target.value })}
                placeholder="What was done immediately after the incident?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Contributing Factors (Optional)"
                value={formData.contributing_factors}
                onChange={(e) => setFormData({ ...formData, contributing_factors: e.target.value })}
                placeholder="What factors contributed to this incident?"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {photoFile ? `Photo: ${photoFile.name}` : 'Upload Photo (Optional)'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {documentFile ? `Doc: ${documentFile.name}` : 'Upload Document (Optional)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} variant="contained">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getReportIcon(selectedReport.report_type)}
                  <Typography variant="h6">{selectedReport.report_number}</Typography>
                </Box>
                {getStatusChip(selectedReport.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Title</Typography>
                  <Typography variant="h6">{selectedReport.title}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{getReportTypeLabel(selectedReport.report_type)}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Severity</Typography>
                  <Chip
                    label={selectedReport.severity}
                    size="small"
                    sx={{
                      bgcolor: getSeverityColor(selectedReport.severity).bg,
                      color: getSeverityColor(selectedReport.severity).color,
                      fontWeight: 500,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{selectedReport.location}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Incident Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedReport.incident_date).toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReport.description}
                  </Typography>
                </Grid>
                
                {selectedReport.persons_involved && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Persons Involved</Typography>
                    <Typography variant="body1">{selectedReport.persons_involved}</Typography>
                  </Grid>
                )}
                
                {selectedReport.witnesses && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Witnesses</Typography>
                    <Typography variant="body1">{selectedReport.witnesses}</Typography>
                  </Grid>
                )}
                
                {selectedReport.immediate_actions_taken && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Immediate Actions Taken</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedReport.immediate_actions_taken}
                    </Typography>
                  </Grid>
                )}
                
                {selectedReport.contributing_factors && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Contributing Factors</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedReport.contributing_factors}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Reported By</Typography>
                  <Typography variant="body1">{selectedReport.reported_by.full_name}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Submitted On</Typography>
                  <Typography variant="body1">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                
                {selectedReport.reviewed_by && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">Reviewed By</Typography>
                      <Typography variant="body1">{selectedReport.reviewed_by.full_name}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">Reviewed On</Typography>
                      <Typography variant="body1">
                        {new Date(selectedReport.reviewed_at!).toLocaleString()}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {selectedReport.review_comments && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="caption" color="text.secondary">Review Comments</Typography>
                      <Typography variant="body2">{selectedReport.review_comments}</Typography>
                    </Alert>
                  </Grid>
                )}
                
                {selectedReport.rejection_reason && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="caption" color="text.secondary">Rejection Reason</Typography>
                      <Typography variant="body2">{selectedReport.rejection_reason}</Typography>
                    </Alert>
                  </Grid>
                )}
                
                {selectedReport.created_record_number && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="caption" color="text.secondary">Record Created</Typography>
                      <Typography variant="body2">
                        This report was filed as record: <strong>{selectedReport.created_record_number}</strong>
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                
                {(selectedReport.photo_evidence_url || selectedReport.additional_document_url) && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Attachments
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {selectedReport.photo_evidence_url && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(selectedReport.photo_evidence_url, '_blank')}
                        >
                          View Photo
                        </Button>
                      )}
                      {selectedReport.additional_document_url && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(selectedReport.additional_document_url, '_blank')}
                        >
                          View Document
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Review Dialog (HSSE Manager only) */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle>Review Report: {selectedReport.report_number}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={reviewAction}
                      label="Action"
                      onChange={(e) => setReviewAction(e.target.value as 'approve' | 'reject')}
                    >
                      <MenuItem value="approve">Approve & File as Record</MenuItem>
                      <MenuItem value="reject">Reject</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {reviewAction === 'approve' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Comments (Optional)"
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Add any comments or notes..."
                    />
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Upon approval, this report will be automatically filed as a record in the Records system.
                    </Alert>
                  </Grid>
                )}
                
                {reviewAction === 'reject' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Rejection Reason"
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this report is being rejected..."
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
              <Button
                onClick={handleReview}
                variant="contained"
                color={reviewAction === 'approve' ? 'success' : 'error'}
                disabled={reviewAction === 'reject' && !rejectionReason.trim()}
              >
                {reviewAction === 'approve' ? 'Approve & File' : 'Reject'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuickReports;

