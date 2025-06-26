import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  category: string;
  status: string;
  version: string;
  revision_number: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
  };
  file_url: string;
  content?: string;
}

const DOCUMENT_TYPES = [
  { value: 'POLICY', label: 'Policy' },
  { value: 'SYSTEM DOCUMENT', label: 'System Document' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'FORM', label: 'Form' },
  { value: 'SSOW', label: 'SSOW' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'HSSE_REVIEW', label: 'HSSE Review' },
  { value: 'OPS_REVIEW', label: 'OPS Review' },
  { value: 'MD_APPROVAL', label: 'MD Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const SearchDocuments: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    document_type: '',
    status: '',
    created_by: '',
    date_from: '',
    date_to: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || Object.values(filters).some(v => v)) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/documents/';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (filters.document_type) {
        params.append('document_type', filters.document_type);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.created_by) {
        params.append('created_by', filters.created_by);
      }
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(url);
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to search documents');
      console.error('Error searching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      document_type: '',
      status: '',
      created_by: '',
      date_from: '',
      date_to: '',
    });
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return theme.palette.info.main;
      case 'HSSE_REVIEW':
        return theme.palette.warning.main;
      case 'OPS_REVIEW':
        return theme.palette.warning.main;
      case 'MD_APPROVAL':
        return theme.palette.warning.main;
      case 'APPROVED':
        return theme.palette.success.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Search Documents
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search documents by title, description, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      value={filters.document_type}
                      onChange={(e) => setFilters({ ...filters, document_type: e.target.value })}
                      label="Document Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {DOCUMENT_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Created By"
                    value={filters.created_by}
                    onChange={(e) => setFilters({ ...filters, created_by: e.target.value })}
                    placeholder="Search by creator name"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date From"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date To"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>

      {/* Search Results */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Results List */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Search Results ({documents.length} documents)
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow 
                      key={document.id} 
                      hover
                      onClick={() => handleViewDocument(document)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {document.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {document.description.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={document.document_type}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={document.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(document.status)}20`,
                            color: getStatusColor(document.status),
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>v{document.version}.{document.revision_number}</TableCell>
                      <TableCell>{document.created_by.name}</TableCell>
                      <TableCell>{formatDate(document.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(document.file_url, '_blank');
                            }}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        {document.status === 'DRAFT' && user?.position === 'HSSE MANAGER' && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to edit
                              }}
                              sx={{ color: theme.palette.warning.main }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Document Details Panel */}
        {selectedDocument && (
          <Box sx={{ width: 400 }}>
            <Typography variant="h6" gutterBottom>
              Document Details
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedDocument.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedDocument.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={selectedDocument.document_type} color="primary" variant="outlined" />
                  <Chip 
                    label={selectedDocument.status} 
                    sx={{
                      backgroundColor: `${getStatusColor(selectedDocument.status)}20`,
                      color: getStatusColor(selectedDocument.status),
                    }}
                  />
                  <Chip label={`v${selectedDocument.version}.${selectedDocument.revision_number}`} variant="outlined" />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created by</Typography>
                    <Typography variant="body2">{selectedDocument.created_by.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography variant="body2">{formatDate(selectedDocument.created_at)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body2">{formatDate(selectedDocument.updated_at)}</Typography>
                  </Box>
                </Box>

                {selectedDocument.content && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Content Preview:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[50], maxHeight: 200, overflow: 'auto' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedDocument.content.substring(0, 300)}...
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchDocuments; 