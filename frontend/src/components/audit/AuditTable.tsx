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
  TablePagination,
  Typography,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface AuditTableData {
  id: string;
  audit_code: string;
  title: string;
  audit_type: string;
  planned_start_date: string;
  planned_end_date: string;
  status: string;
  lead_auditor_name: string;
  iso_clause_count: number;
  findings_count: number;
  major_ncs?: number;
  minor_ncs?: number;
  observations?: number;
  capas_open?: number;
  capas_closed?: number;
  compliance_score?: number;
  is_overdue: boolean;
  days_until_start: number;
}

const AuditTable: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditTableData | null>(null);
  
  useEffect(() => {
    fetchAudits();
  }, []);
  
  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/audits/plans/');
      setAudits(response.data);
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'CLOSED':
        return theme.palette.success.main;
      case 'IN_PROGRESS':
        return theme.palette.info.main;
      case 'SCHEDULED':
        return theme.palette.warning.main;
      case 'DRAFT':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'CLOSED':
        return <CompleteIcon sx={{ fontSize: 16 }} />;
      case 'IN_PROGRESS':
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case 'SCHEDULED':
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
    }
  };
  
  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  };
  
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export to PDF');
  };
  
  const filteredAudits = audits.filter(audit =>
    audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.audit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.lead_auditor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, audit: AuditTableData) => {
    setAnchorEl(event.currentTarget);
    setSelectedAudit(audit);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Comprehensive Audit Table
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All audit parameters and findings at a glance
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            size="small"
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            size="small"
          >
            Export PDF
          </Button>
        </Stack>
      </Box>
      
      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 400 }}
          />
        </Stack>
      </Paper>
      
      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'auto' }}>
        <Table sx={{ minWidth: 1200 }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                Audit Code
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, minWidth: 200 }}>
                Title & Date
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                Type
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                Status
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                ISO Clauses
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                Findings
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                CAPAs
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                Lead Auditor
              </TableCell>
              <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 700, whiteSpace: 'nowrap' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAudits
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((audit) => (
                <TableRow
                  key={audit.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    bgcolor: audit.is_overdue ? alpha(theme.palette.error.main, 0.03) : 'inherit',
                  }}
                >
                  {/* Audit Code */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: theme.palette.primary.main,
                      }}
                    >
                      {audit.audit_code}
                    </Typography>
                    {audit.is_overdue && (
                      <Chip
                        label="OVERDUE"
                        size="small"
                        color="error"
                        sx={{ mt: 0.5, fontSize: '0.65rem', height: 18 }}
                      />
                    )}
                  </TableCell>
                  
                  {/* Title & Date */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {audit.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {audit.planned_start_date} to {audit.planned_end_date}
                    </Typography>
                  </TableCell>
                  
                  {/* Type */}
                  <TableCell>
                    <Chip
                      label={audit.audit_type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(audit.status)}
                      label={audit.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(audit.status), 0.1),
                        color: getStatusColor(audit.status),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  
                  {/* ISO Clauses */}
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {audit.iso_clause_count}
                    </Typography>
                  </TableCell>
                  
                  {/* Findings Breakdown */}
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {audit.major_ncs !== undefined && audit.major_ncs > 0 && (
                        <Tooltip title="Major NCs">
                          <Chip
                            icon={<ErrorIcon sx={{ fontSize: 14 }} />}
                            label={audit.major_ncs}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: theme.palette.error.main,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </Tooltip>
                      )}
                      {audit.minor_ncs !== undefined && audit.minor_ncs > 0 && (
                        <Tooltip title="Minor NCs">
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: 14 }} />}
                            label={audit.minor_ncs}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </Tooltip>
                      )}
                      {audit.observations !== undefined && audit.observations > 0 && (
                        <Tooltip title="Observations">
                          <Chip
                            label={audit.observations}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </Tooltip>
                      )}
                      {audit.findings_count === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  
                  {/* CAPAs */}
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {audit.capas_open || 0} Open
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {audit.capas_closed || 0} Closed
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  {/* Lead Auditor */}
                  <TableCell>
                    <Typography variant="body2">
                      {audit.lead_auditor_name}
                    </Typography>
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, audit)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        
        {filteredAudits.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body2" color="text.secondary">
              No audits found
            </Typography>
          </Box>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredAudits.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      
      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download Report
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuditTable;

