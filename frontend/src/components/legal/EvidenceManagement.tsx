import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  IconButton,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

// Helper function
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

interface EvidenceDocument {
  id: number;
  entry: number;
  entry_title?: string;
  document: string;
  uploaded_at: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  is_archived?: boolean;
  archived_at?: string;
  review_year?: number;
  document_type?: string;
  description?: string;
}

interface ObligationOption {
  id: number;
  title: string;
  compliance_status: string;
}

const EvidenceManagement: React.FC = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);
  const [obligations, setObligations] = useState<ObligationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedObligation, setSelectedObligation] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterObligation, setFilterObligation] = useState<number | ''>('');
  const [showArchived, setShowArchived] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchDocuments();
    fetchObligations();
  }, [filterObligation]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterObligation) params.entry = filterObligation;

      const response = await axiosInstance.get('/legals/register-documents/', { params });
      const docs = response.data.results || response.data;
      
      // Enrich with obligation titles
      const enrichedDocs = await Promise.all(
        docs.map(async (doc: EvidenceDocument) => {
          try {
            const entryResponse = await axiosInstance.get(`/legals/register-entries/${doc.entry}/`);
            return {
              ...doc,
              entry_title: entryResponse.data.title,
              file_name: doc.document.split('/').pop(),
            };
          } catch {
            return {
              ...doc,
              entry_title: 'Unknown Obligation',
              file_name: doc.document.split('/').pop(),
            };
          }
        })
      );

      setDocuments(enrichedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setSnackbar({ open: true, message: 'Failed to fetch documents', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchObligations = async () => {
    try {
      const response = await axiosInstance.get('/legals/register-entries/');
      setObligations(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching obligations:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedObligation) {
      setSnackbar({ open: true, message: 'Please select both a file and an obligation', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('entry', selectedObligation.toString());

      await axiosInstance.post('/legals/register-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSnackbar({ open: true, message: 'Document uploaded successfully!', severity: 'success' });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setSelectedObligation(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setSnackbar({ open: true, message: 'Failed to upload document', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doc: EvidenceDocument) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.file_name}"?`)) return;

    try {
      await axiosInstance.delete(`/legals/register-documents/${doc.id}/`);
      setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'success' });
      fetchDocuments();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete document', severity: 'error' });
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <PdfIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />;
      default:
        return <FileIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const filteredDocuments = documents.filter(doc => {
    // Filter by archived status
    if (!showArchived && doc.is_archived) return false;
    
    // Filter by search
    if (search && 
        !doc.entry_title?.toLowerCase().includes(search.toLowerCase()) &&
        !doc.file_name?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const activeDocuments = documents.filter(d => !d.is_archived);
  const archivedDocuments = documents.filter(d => d.is_archived);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Evidence Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload and manage compliance evidence documents (certificates, permits, inspection reports, etc.)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={`Active: ${activeDocuments.length}`}
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`Archived: ${archivedDocuments.length}`}
            sx={{
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              color: theme.palette.grey[600],
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {/* Actions & Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Search
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Filter by Obligation
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filterObligation}
                    onChange={(e) => setFilterObligation(e.target.value as number | '')}
                    displayEmpty
                  >
                    <MenuItem value="">All Obligations</MenuItem>
                    {obligations.map((obl) => (
                      <MenuItem key={obl.id} value={obl.id}>
                        {obl.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ pt: 2.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadModalOpen(true)}
                  sx={{ height: 40 }}
                >
                  Upload Evidence
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Summary & Archive Toggle */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          {showArchived && ' (including archived)'}
        </Typography>
        <Button
          size="small"
          variant={showArchived ? 'contained' : 'outlined'}
          onClick={() => setShowArchived(!showArchived)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {showArchived ? 'Hide' : 'Show'} Archived ({archivedDocuments.length})
        </Button>
      </Box>

      {/* Documents Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading documents...</Typography>
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <AttachFileIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No evidence documents found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your first compliance evidence document to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Evidence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card
                sx={{
                  height: '100%',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
                    {getFileIcon(doc.file_name || '')}
                    {doc.is_archived && (
                      <Chip
                        label={`Archived ${doc.review_year || ''}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: alpha(theme.palette.grey[600], 0.9),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 20,
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      opacity: doc.is_archived ? 0.7 : 1,
                    }}
                  >
                    {doc.file_name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {doc.entry_title}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: doc.is_archived ? 1 : 2 }}>
                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                  </Typography>

                  {doc.is_archived && doc.archived_at && (
                    <Typography variant="caption" sx={{ display: 'block', mb: 2, color: theme.palette.warning.main, fontWeight: 600 }}>
                      Archived: {new Date(doc.archived_at).toLocaleDateString()}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      href={doc.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ flex: 1, borderRadius: 2 }}
                    >
                      View
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(doc)}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Modal */}
      <Dialog
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            fontWeight: 700,
          }}
        >
          Upload Compliance Evidence
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                  Select Compliance Obligation *
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    value={selectedObligation || ''}
                    onChange={(e) => setSelectedObligation(e.target.value as number)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select the obligation this evidence supports
                    </MenuItem>
                    {obligations.map((obl) => (
                      <MenuItem key={obl.id} value={obl.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {obl.title}
                          </Typography>
                          <Chip
                            label={obl.compliance_status}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 20,
                              textTransform: 'uppercase',
                            }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileSelect}
                />
                <UploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                  {selectedFile ? selectedFile.name : 'Click to select file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported: PDF, Images, Word, Excel (Max 10MB)
                </Typography>
              </Box>
            </Grid>

            {selectedFile && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setUploadModalOpen(false);
              setSelectedFile(null);
              setSelectedObligation(null);
            }}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || !selectedObligation || loading}
            sx={{
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EvidenceManagement;

