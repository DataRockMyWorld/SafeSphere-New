import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
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
  TableSortLabel,
  TablePagination,
  useTheme,
  Menu,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Tooltip,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as CreateFolderIcon,
  NavigateNext as NavigateNextIcon,
  Share as ShareIcon,
  Info as InfoIcon,
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
  file_size?: number;
  file_type?: string;
  folder_path?: string;
}

interface Folder {
  id: string;
  name: string;
  type: string;
  parent: string | null;
  document_count: number;
  created_at: string;
}

type ViewMode = 'grid' | 'list' | 'detail';
type SortField = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

// Folder interface matching API response
interface Folder {
  id: string;
  name: string;
  value: string;
  description: string;
  document_count: number;
  is_empty: boolean;
  can_be_deleted: boolean;
  created_at: string;
}

// Default folders fallback (for backward compatibility)
const DEFAULT_FOLDERS = [
  { value: 'POLICY', label: 'Policy' },
  { value: 'SYSTEM_DOCUMENT', label: 'System Document' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'FORM', label: 'Form' },
  { value: 'SSOW', label: 'SSOW' },
  { value: 'OTHER', label: 'Other' },
];

// Memoized Document Row Component
const DocumentRow = memo(({ 
  document, 
  onView,
  onDelete,
  onContextMenu,
}: {
  document: Document;
  onView: () => void;
  onDelete: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <TableRow
      hover
      onContextMenu={onContextMenu}
      onClick={onView}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DocumentIcon sx={{ color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {document.title}
            </Typography>
            {document.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {document.description.substring(0, 80)}...
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip 
          label={document.document_type} 
          size="small" 
          variant="outlined" 
          sx={{ fontWeight: 500 }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">v{document.version}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {new Date(document.created_at).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="View/Open">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(); }}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {user?.position === 'HSSE MANAGER' && (
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
});

DocumentRow.displayName = 'DocumentRow';

const ImprovedDocumentLibrary: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(24);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string; documentCount: number } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: any } | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Breadcrumb path
  const [folderPath, setFolderPath] = useState<Array<{ label: string; value: string }>>([
    { label: 'Folders', value: '' }
  ]);

  // Fetch folders from API
  const fetchFolders = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/documents/folders/');
      setFolders(response.data);
    } catch (err) {
      console.error('Error fetching folders:', err);
      // Fallback to default folders if API fails
      setFolders(DEFAULT_FOLDERS.map(f => ({
        id: f.value,
        name: f.label,
        value: f.value,
        description: '',
        document_count: 0,
        is_empty: true,
        can_be_deleted: false,
        created_at: new Date().toISOString(),
      })));
    }
  }, []);

  // Fetch documents with optimization
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/documents/';
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedFolder) {
        // Find folder by value and use it for filtering
        const folder = folders.find(f => f.value === selectedFolder);
        if (folder) {
          params.append('category', folder.value);
        }
      }
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await axiosInstance.get(url);
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFolder, folders]);

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchDocuments(), 300);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  // Calculate document counts (memoized) - use folders from API
  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach(folder => {
      counts[folder.value] = folder.document_count;
    });
    // Also count from documents as fallback
    documents.forEach(doc => {
      const folderValue = doc.document_type === 'SYSTEM DOCUMENT' ? 'SYSTEM_DOCUMENT' : doc.document_type;
      if (!counts[folderValue]) {
        counts[folderValue] = documents.filter(d => 
          (d.document_type === 'SYSTEM DOCUMENT' ? 'SYSTEM_DOCUMENT' : d.document_type) === folderValue
        ).length;
      }
    });
    return counts;
  }, [documents, folders]);

  // Filter and sort documents (memoized)
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = selectedFolder 
      ? documents.filter(doc => {
          // Map document_type to folder value (handle SYSTEM DOCUMENT -> SYSTEM_DOCUMENT)
          const docType = doc.document_type === 'SYSTEM DOCUMENT' ? 'SYSTEM_DOCUMENT' : doc.document_type;
          return docType === selectedFolder;
        })
      : documents;

    // Apply search (null-safe fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        (doc.title || '').toLowerCase().includes(query) ||
        (doc.description || '').toLowerCase().includes(query) ||
        (doc.document_type || '').toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'size':
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
        case 'type':
          comparison = a.document_type.localeCompare(b.document_type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, selectedFolder, searchQuery, sortField, sortOrder]);

  // Handlers
  const handleFolderClick = useCallback((folderValue: string, folderLabel: string) => {
    setSelectedFolder(folderValue);
    setFolderPath(prev => [...prev, { label: folderLabel, value: folderValue }]);
    setSelectedItems(new Set());
    setPage(0);
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setSelectedFolder(newPath[newPath.length - 1].value);
    setSelectedItems(new Set());
    setPage(0);
  }, [folderPath]);


  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setSnackbar({ open: true, message: 'Please select a file to upload', severity: 'error' });
      return;
    }

    if (!uploadFormData.title.trim()) {
      setSnackbar({ open: true, message: 'Please enter a document title', severity: 'error' });
      return;
    }

    // Use selectedFolder if inside a folder, otherwise use uploadFormData.category
    const folderToUse = selectedFolder || uploadFormData.category;
    
    if (!folderToUse) {
      setSnackbar({ open: true, message: 'Please select a folder', severity: 'error' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadFormData.title);
      formData.append('description', uploadFormData.description);
      
      // Map folder value back to document_type (SYSTEM_DOCUMENT -> SYSTEM DOCUMENT)
      const documentType = folderToUse === 'SYSTEM_DOCUMENT' 
        ? 'SYSTEM DOCUMENT' 
        : folderToUse;
      formData.append('document_type', documentType);

      await uploadFile('/documents/', formData);

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadFormData({ title: '', description: '', category: '' });
      setSnackbar({ open: true, message: 'Document uploaded successfully', severity: 'success' });
      fetchDocuments();
      fetchFolders(); // Refresh folder counts
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail ||
                           err.response?.data?.file?.[0] ||
                           err.response?.data?.title?.[0] ||
                           err.response?.data?.document_type?.[0] ||
                           'Failed to upload document';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('Upload error:', err.response?.data);
    }
  }, [selectedFile, uploadFormData, selectedFolder, fetchDocuments, fetchFolders]);

  const handleDownload = useCallback(async (doc: Document) => {
    try {
      if (!doc.file_url) return;
      // Open file in new tab for viewing (works for PDF, images, etc.)
      window.open(doc.file_url, '_blank');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to open document', severity: 'error' });
    }
  }, []);

  const handleView = useCallback((doc: Document) => {
    // Open file in new tab for viewing
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      setSnackbar({ open: true, message: 'No file available for this document', severity: 'warning' });
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: any) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a folder name', severity: 'error' });
      return;
    }
    
    try {
      // Generate value from name (uppercase, replace spaces with underscores)
      const value = newFolderName.toUpperCase().replace(/\s+/g, '_');
      
      const response = await axiosInstance.post('/documents/folders/', {
        name: newFolderName.trim(),
        value: value,
        description: newFolderDescription.trim(),
      });
      
      // Refresh folders list
      await fetchFolders();
      
      setSnackbar({ open: true, message: 'Folder created successfully', severity: 'success' });
      setNewFolderDialogOpen(false);
      setNewFolderName('');
      setNewFolderDescription('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.value?.[0] || 
                           err.response?.data?.name?.[0] || 
                           err.response?.data?.detail || 
                           'Failed to create folder';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('Error creating folder:', err);
    }
  }, [newFolderName, newFolderDescription, fetchFolders]);

  const handleDelete = useCallback(async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/documents/${documentId}/`);
      
      // Refresh documents list
      await fetchDocuments();
      
      setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'success' });
      setContextMenu(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete document.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('Error deleting document:', err);
    }
  }, [fetchDocuments]);

  const handleOpenDeleteFolderDialog = useCallback((folderId: string, folderName: string, documentCount: number) => {
    setFolderToDelete({ id: folderId, name: folderName, documentCount });
    setDeleteConfirmationText('');
    setDeleteFolderDialogOpen(true);
  }, []);

  const handleDeleteFolder = useCallback(async () => {
    if (!folderToDelete) return;
    
    // Require typing folder name to confirm
    if (deleteConfirmationText !== folderToDelete.name) {
      setSnackbar({ 
        open: true, 
        message: 'Folder name does not match. Please type the folder name exactly to confirm deletion.', 
        severity: 'error' 
      });
      return;
    }

    // Prevent deletion if folder contains files
    if (folderToDelete.documentCount > 0) {
      setSnackbar({ 
        open: true, 
        message: `Cannot delete folder. It contains ${folderToDelete.documentCount} document(s). Please remove all documents first.`, 
        severity: 'error' 
      });
      setDeleteFolderDialogOpen(false);
      return;
    }
    
    try {
      await axiosInstance.delete(`/documents/folders/${folderToDelete.id}/`);
      
      // Refresh folders list
      await fetchFolders();
      
      // If the deleted folder was selected, clear selection
      const deletedFolder = folders.find(f => f.id === folderToDelete.id);
      if (selectedFolder && deletedFolder && deletedFolder.value === selectedFolder) {
        setSelectedFolder('');
        setFolderPath([{ label: 'Folders', value: '' }]);
      }
      
      setSnackbar({ open: true, message: 'Folder deleted successfully', severity: 'success' });
      setContextMenu(null);
      setDeleteFolderDialogOpen(false);
      setFolderToDelete(null);
      setDeleteConfirmationText('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                           'Failed to delete folder. Make sure the folder is empty.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('Error deleting folder:', err);
    }
  }, [folderToDelete, deleteConfirmationText, fetchFolders, selectedFolder, folders]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with Prominent Search */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Document Library
          </Typography>
          
          {user?.position === 'HSSE MANAGER' && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<CreateFolderIcon />}
                onClick={() => setNewFolderDialogOpen(true)}
                size="small"
                sx={{ fontSize: '0.8rem', py: 0.5 }}
              >
                New Folder
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                size="small"
                sx={{ fontSize: '0.8rem', py: 0.5 }}
              >
                Upload
              </Button>
            </Stack>
          )}
        </Box>

        {/* Prominent Search Bar - Only show when inside a folder */}
        {selectedFolder && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 1.5, 
              mb: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.2s ease',
              '&:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                placeholder="Search documents by title, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="medium"
                fullWidth
                sx={{ 
                  flex: 1,
                  minWidth: { xs: '100%', sm: 400 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.background.default,
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
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
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  setSelectedFolder('');
                  setFolderPath([{ label: 'Folders', value: '' }]);
                  setPage(0);
                }}
                size="medium"
                sx={{ 
                  minWidth: { xs: '100%', sm: 'auto' },
                  whiteSpace: 'nowrap',
                }}
              >
                Back to Folders
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Breadcrumb Navigation */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5 }}>
          {folderPath.map((path, index) => (
            <Link
              key={path.value}
              color={index === folderPath.length - 1 ? 'text.primary' : 'inherit'}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleBreadcrumbClick(index);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                fontWeight: index === folderPath.length - 1 ? 600 : 400,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {path.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Results Indicator */}
      {searchQuery && filteredAndSortedDocuments.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} icon={false}>
          <Typography variant="body2">
            Found <strong>{filteredAndSortedDocuments.length}</strong> document{filteredAndSortedDocuments.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </Typography>
        </Alert>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mt: 8, gap: 2 }}>
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary">
            Loading documents...
          </Typography>
        </Box>
      ) : !selectedFolder ? (
        // Folder List View
          folders.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <FolderIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Folders Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {user?.position === 'HSSE MANAGER' 
                  ? 'Create your first folder to organize documents'
                  : 'No folders have been created yet'}
              </Typography>
              {user?.position === 'HSSE MANAGER' && (
                <Button
                  variant="contained"
                  startIcon={<CreateFolderIcon />}
                  onClick={() => setNewFolderDialogOpen(true)}
                >
                  Create Folder
                </Button>
              )}
            </Paper>
          ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.grey[50] }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Folder Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Documents
                    </Typography>
                  </TableCell>
                  {user?.position === 'HSSE MANAGER' && (
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Actions
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {folders.map((folder) => (
                  <TableRow
                    key={folder.id}
                    hover
                    onClick={() => handleFolderClick(folder.value, folder.name)}
                    onContextMenu={(e) => handleContextMenu(e, folder)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FolderIcon sx={{ fontSize: 40, color: '#FDD835' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {folder.name}
                          </Typography>
                          {folder.description && (
                            <Typography variant="caption" color="text.secondary">
                              {folder.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${categoryCount[folder.value] || folder.document_count || 0} documents`} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    {user?.position === 'HSSE MANAGER' && (
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title={folder.can_be_deleted ? "Delete folder" : "Folder must be empty to delete"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteFolderDialog(folder.id, folder.name, categoryCount[folder.value] || folder.document_count || 0)}
                              disabled={!folder.can_be_deleted}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )
      ) : (
        // Document List View
        filteredAndSortedDocuments.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <DocumentIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No Documents Found' : 'No Documents in This Folder'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery 
                ? `No documents match "${searchQuery}". Try a different search term.`
                : 'This folder is empty. Upload documents to get started.'}
            </Typography>
            {user?.position === 'HSSE MANAGER' && !searchQuery && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Document
              </Button>
            )}
            {searchQuery && (
              <Button
                variant="outlined"
                onClick={() => setSearchQuery('')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => theme.palette.grey[50] }}>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Name
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'type'}
                    direction={sortField === 'type' ? sortOrder : 'asc'}
                    onClick={() => handleSort('type')}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Type
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Version
                  </Typography>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'date'}
                    direction={sortField === 'date' ? sortOrder : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Date
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedDocuments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onView={() => handleView(doc)}
                    onDelete={() => handleDelete(doc.id)}
                    onContextMenu={(e) => handleContextMenu(e, doc)}
                  />
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredAndSortedDocuments.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[12, 24, 48, 96]}
          />
        </TableContainer>
        )
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedFolder && (
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  Document will be uploaded to: <strong>{folders.find(f => f.value === selectedFolder)?.name || selectedFolder}</strong>
                </Typography>
              </Alert>
            )}
            <TextField
              fullWidth
              label="Title"
              value={uploadFormData.title}
              onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
            />
            {!selectedFolder && (
              <FormControl fullWidth>
                <InputLabel>Folder</InputLabel>
                <Select
                  value={uploadFormData.category}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                  label="Folder"
                >
                  {folders.map((folder) => (
                    <MenuItem key={folder.id} value={folder.value}>
                      {folder.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button component="label" variant="outlined" startIcon={<UploadIcon />} fullWidth>
              Select File
              <input 
                type="file" 
                hidden 
                onChange={handleFileSelect} 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" 
              />
            </Button>
            {selectedFile && (
              <Typography variant="caption" color="text.secondary">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="caption">
                <strong>Recommended:</strong> PDF format for final/approved documents.
                <br />
                <strong>Allowed:</strong> PDF, Word, Excel, Images (max 10MB)
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedFile || !uploadFormData.title.trim() || (!selectedFolder && !uploadFormData.category)}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog 
        open={deleteFolderDialogOpen} 
        onClose={() => {
          setDeleteFolderDialogOpen(false);
          setFolderToDelete(null);
          setDeleteConfirmationText('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon />
          Delete Folder
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" icon={false} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ Warning: This action cannot be undone!
            </Typography>
            <Typography variant="body2">
              You are about to permanently delete the folder <strong>"{folderToDelete?.name}"</strong>.
            </Typography>
          </Alert>

          {folderToDelete && folderToDelete.documentCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                ⚠️ This folder contains {folderToDelete.documentCount} document{folderToDelete.documentCount !== 1 ? 's' : ''}!
              </Typography>
              <Typography variant="body2">
                You must remove all documents from this folder before it can be deleted.
              </Typography>
            </Alert>
          )}

          {folderToDelete && folderToDelete.documentCount === 0 && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This folder is empty and can be safely deleted. To confirm deletion, please type the folder name below:
              </Typography>
              <TextField
                fullWidth
                label={`Type "${folderToDelete.name}" to confirm`}
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={folderToDelete.name}
                error={deleteConfirmationText !== '' && deleteConfirmationText !== folderToDelete.name}
                helperText={
                  deleteConfirmationText !== '' && deleteConfirmationText !== folderToDelete.name
                    ? 'Folder name does not match'
                    : 'Type the exact folder name to confirm deletion'
                }
                autoFocus
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setDeleteFolderDialogOpen(false);
              setFolderToDelete(null);
              setDeleteConfirmationText('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteFolder}
            variant="contained"
            color="error"
            disabled={
              !folderToDelete || 
              (folderToDelete.documentCount === 0 && deleteConfirmationText !== folderToDelete.name) ||
              folderToDelete.documentCount > 0
            }
            startIcon={<DeleteIcon />}
          >
            {folderToDelete && folderToDelete.documentCount > 0 ? 'Cannot Delete (Has Files)' : 'Delete Folder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => {
        setNewFolderDialogOpen(false);
        setNewFolderName('');
        setNewFolderDescription('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name (e.g., Safety Procedures)"
              autoFocus
              required
              helperText="The value will be generated automatically (uppercase, underscores)"
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              placeholder="Optional description for this folder"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewFolderDialogOpen(false);
            setNewFolderName('');
            setNewFolderDescription('');
          }}>Cancel</Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            disabled={!newFolderName.trim()}
            startIcon={<CreateFolderIcon />}
          >
            Create Folder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      {contextMenu && (
        <Menu
          open={Boolean(contextMenu)}
          onClose={() => setContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {/* Document context menu */}
          {contextMenu?.item && 'document_type' in contextMenu.item && (
            <>
              <MenuItem 
                onClick={() => {
                  const doc = contextMenu.item as Document;
                  handleView(doc);
                  setContextMenu(null);
                }}
              >
                <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
                <ListItemText>View/Open</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  const doc = contextMenu.item as Document;
                  handleDownload(doc);
                  setContextMenu(null);
                }}
              >
                <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Download</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  const doc = contextMenu.item as Document;
                  navigate(`/document-management/library/${doc.id}`);
                  setContextMenu(null);
                }}
              >
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>
              <Divider />
              {user?.position === 'HSSE MANAGER' && (
                <MenuItem 
                  onClick={() => {
                    const doc = contextMenu.item as Document;
                    handleDelete(doc.id);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText>Delete Document</ListItemText>
                </MenuItem>
              )}
            </>
          )}
          
          {/* Folder context menu */}
          {contextMenu?.item && 'can_be_deleted' in contextMenu.item && user?.position === 'HSSE MANAGER' && (
            <>
              <MenuItem 
                onClick={() => {
                  const folder = contextMenu.item as Folder;
                  handleFolderClick(folder.value, folder.name);
                  setContextMenu(null);
                }}
              >
                <ListItemIcon><FolderOpenIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Open Folder</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => {
                  const folder = contextMenu.item as Folder;
                  handleOpenDeleteFolderDialog(folder.id, folder.name, categoryCount[folder.value] || folder.document_count || 0);
                  setContextMenu(null);
                }}
                disabled={!contextMenu.item.can_be_deleted}
                sx={{ color: contextMenu.item.can_be_deleted ? 'error.main' : 'text.disabled' }}
              >
                <ListItemIcon>
                  <DeleteIcon 
                    fontSize="small" 
                    color={contextMenu.item.can_be_deleted ? 'error' : 'disabled'} 
                  />
                </ListItemIcon>
                <ListItemText>Delete Folder</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>
      )}

      {/* Snackbar for notifications */}
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

export default memo(ImprovedDocumentLibrary);

