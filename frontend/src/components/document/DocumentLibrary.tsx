import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge,
  useTheme,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  FilterList as FilterIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance, { uploadFile } from '../../utils/axiosInstance';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  category: string;
  status: string;
  version: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
  };
  file_url: string;
}

const DOCUMENT_TYPES = [
  { value: 'POLICY', label: 'Policy' },
  { value: 'SYSTEM DOCUMENT', label: 'System Document' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'FORM', label: 'Form' },
  { value: 'SSOW', label: 'SSOW' },
  { value: 'OTHER', label: 'Other' },
];

const DocumentLibrary: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);

  // Calculate document counts by category
  const categoryCount = documents.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, []); // Empty dependency array for initial load only

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/documents/';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching documents with URL:', url); // Debug log
      const response = await axiosInstance.get(url);
      console.log('Documents response:', response.data); // Debug log
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadFormData.title);
      formData.append('description', uploadFormData.description);
      formData.append('document_type', uploadFormData.category);

      await uploadFile('/documents/', formData);

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadFormData({ title: '', description: '', category: '' });
      fetchDocuments();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage || 'Failed to upload document');
      console.error('Error uploading document:', err);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategoryMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return theme.palette.info.main;
      case 'PENDING':
        return theme.palette.warning.main;
      case 'APPROVED':
        return theme.palette.success.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getSelectedCategoryLabel = () => {
    if (!selectedCategory) return 'All Categories';
    return DOCUMENT_TYPES.find(type => type.value === selectedCategory)?.label || selectedCategory;
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Document Library
        </Typography>
        {user?.position === 'HSSE MANAGER' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate('/document-management/editor')}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: theme.palette.primary.light,
                },
              }}
            >
              Create New Document
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Upload Document
            </Button>
          </Box>
        )}
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <TextField
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={(e) => setCategoryMenuAnchor(e.currentTarget)}
          sx={{
            borderColor: selectedCategory ? theme.palette.primary.main : theme.palette.divider,
            color: selectedCategory ? theme.palette.primary.main : theme.palette.text.primary,
            minWidth: 180,
          }}
        >
          {getSelectedCategoryLabel()}
          {selectedCategory && (
            <Badge
              badgeContent={categoryCount[selectedCategory] || 0}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Button>

        {selectedCategory && (
          <Button
            variant="text"
            onClick={() => setSelectedCategory('')}
            sx={{ color: theme.palette.text.secondary }}
          >
            Clear Filter
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Documents Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Document Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((document) => (
                  <TableRow key={document.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography noWrap sx={{ maxWidth: 300 }}>
                          {document.title}
                        </Typography>
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
                    <TableCell>v{document.version}</TableCell>
                    <TableCell>{document.created_by.name}</TableCell>
                    <TableCell>
                      {new Date(document.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => window.open(document.file_url, '_blank')}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      {/* Show Edit button only for HSSE Manager on DRAFT documents */}
                      {document.status === 'DRAFT' && user?.position === 'HSSE MANAGER' && (
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/document-management/library/${document.id}/edit`)}
                          sx={{ color: theme.palette.warning.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {/* Show Request Change button for non-HSSE Manager users */}
                      {user?.position !== 'HSSE MANAGER' && (
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/document-management/change-request/${document.id}`)}
                          sx={{ color: theme.palette.info.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {user?.role === 'ADMIN' && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this document?')) {
                              axiosInstance.delete(`/documents/${document.id}/`).then(fetchDocuments);
                            }
                          }}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={documents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Category Filter Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
        PaperProps={{
          sx: {
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleCategorySelect('')}>
          <ListItemText primary="All Categories" />
          <Badge badgeContent={documents.length} color="primary" />
        </MenuItem>
        {DOCUMENT_TYPES.map((type) => (
          <MenuItem key={type.value} onClick={() => handleCategorySelect(type.value)}>
            <ListItemText primary={type.label} />
            <Badge badgeContent={categoryCount[type.value] || 0} color="primary" />
          </MenuItem>
        ))}
      </Menu>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={uploadFormData.title}
              onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={uploadFormData.category}
                onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                label="Document Type"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Select File
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
              />
            </Button>
            {selectedFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentLibrary; 