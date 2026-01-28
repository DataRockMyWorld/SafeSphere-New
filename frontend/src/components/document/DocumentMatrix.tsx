import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TablePagination,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

interface Document {
  id: string;
  title: string;
  document_type: string;
  version: string;
  revision_number: number;
  status: string;
  document_classification?: string;
  storage_location?: string;
  access_level?: string;
  next_review_date?: string;
  approved_at?: string;
  approved_by?: {
    id: number;
    full_name: string;
  };
  created_at: string;
  file_url?: string;
  distribution_list?: Array<{
    id: number;
    full_name: string;
    email: string;
  }>;
  iso_clauses?: Array<{
    id: number;
    clause_number: string;
    title: string;
  }>;
  is_obsolete?: boolean;
  replaced_by?: {
    id: string;
    title: string;
  };
}

const DocumentMatrix: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterClassification, setFilterClassification] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/documents/');
      const docs = Array.isArray(response.data) ? response.data : response.data.results || [];
      setDocuments(docs);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title?.toLowerCase().includes(query) ||
        doc.document_type?.toLowerCase().includes(query) ||
        doc.storage_location?.toLowerCase().includes(query) ||
        doc.document_classification?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(doc => doc.document_type === filterType);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    // Classification filter
    if (filterClassification !== 'ALL') {
      filtered = filtered.filter(doc => doc.document_classification === filterClassification);
    }

    return filtered;
  }, [documents, searchQuery, filterType, filterStatus, filterClassification]);

  // Paginated documents
  const paginatedDocuments = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredDocuments.slice(start, start + rowsPerPage);
  }, [filteredDocuments, page, rowsPerPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return theme.palette.success.main;
      case 'REJECTED': return theme.palette.error.main;
      case 'DRAFT': return theme.palette.info.main;
      default: return theme.palette.warning.main;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Document Matrix
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ISO 45001 Compliant Document Register - Complete overview of all documents with location and status
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="POLICY">Policy</MenuItem>
              <MenuItem value="SYSTEM DOCUMENT">System Document</MenuItem>
              <MenuItem value="PROCEDURE">Procedure</MenuItem>
              <MenuItem value="FORM">Form</MenuItem>
              <MenuItem value="SSOW">SSOW</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="HSSE_REVIEW">HSSE Review</MenuItem>
              <MenuItem value="OPS_REVIEW">OPS Review</MenuItem>
              <MenuItem value="MD_APPROVAL">MD Approval</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Classification</InputLabel>
            <Select value={filterClassification} label="Classification" onChange={(e) => setFilterClassification(e.target.value)}>
              <MenuItem value="ALL">All Classifications</MenuItem>
              <MenuItem value="CONTROLLED">Controlled</MenuItem>
              <MenuItem value="UNCONTROLLED">Uncontrolled</MenuItem>
              <MenuItem value="REFERENCE">Reference</MenuItem>
              <MenuItem value="EXTERNAL">External</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Document Matrix Table */}
      <Paper sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Document</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Type</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Version</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Status</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Classification</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Storage Location</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Access Level</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Next Review</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Approved</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading document matrix...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Documents Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL' || filterClassification !== 'ALL'
                        ? 'No documents match your filters. Try adjusting your search criteria.'
                        : 'No documents available. Upload your first document to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocuments.map((doc) => (
                  <TableRow 
                    key={doc.id} 
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: doc.is_obsolete ? theme.palette.grey[50] : 'inherit',
                      opacity: doc.is_obsolete ? 0.7 : 1,
                    }}
                    onClick={() => navigate(`/document-management/library/${doc.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {doc.title}
                          </Typography>
                          {doc.is_obsolete && (
                            <Chip
                              label="Obsolete"
                              size="small"
                              sx={{ 
                                height: 18, 
                                fontSize: '0.65rem',
                                mt: 0.5,
                                bgcolor: theme.palette.warning.light,
                                color: theme.palette.warning.dark,
                              }}
                            />
                          )}
                          {doc.replaced_by && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Replaced by: {doc.replaced_by.title}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={doc.document_type} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        v{doc.version} (Rev {doc.revision_number})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(doc.status)}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(doc.status)}20`,
                          color: getStatusColor(doc.status),
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.document_classification || 'Controlled'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {doc.storage_location ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {doc.storage_location}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Not specified
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {doc.access_level === 'PUBLIC' && <PublicIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />}
                        {doc.access_level === 'RESTRICTED' && <LockIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />}
                        {doc.access_level === 'CONFIDENTIAL' && <LockIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />}
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {doc.access_level || 'Internal'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {doc.next_review_date ? (
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {formatDate(doc.next_review_date)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Not set
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.approved_at ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {formatDate(doc.approved_at)}
                          </Typography>
                          {doc.approved_by && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              by {doc.approved_by.full_name}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Not approved
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => navigate(`/document-management/library/${doc.id}`)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {doc.file_url && (
                          <Tooltip title="Download">
                            <IconButton 
                              size="small"
                              component="a"
                              href={doc.file_url}
                              download
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredDocuments.length > 0 && (
          <TablePagination
            component="div"
            count={filteredDocuments.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Documents per page:"
          />
        )}
      </Paper>
    </Box>
  );
};

export default DocumentMatrix;
