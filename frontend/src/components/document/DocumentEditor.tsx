import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  useTheme,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  content?: string;
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

const DocumentEditor: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    content: '',
  });

  useEffect(() => {
    if (id) {
      fetchDocument();
    } else {
      // Creating a new document
      setLoading(false);
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/documents/${id}/`);
      const doc = response.data;
      setDocument(doc);
      setFormData({
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type,
        content: doc.content || '',
      });
    } catch (err) {
      setError('Failed to fetch document');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (id) {
        // Update existing document
        await axiosInstance.patch(`/documents/${id}/`, formData);
      } else {
        // Create new document
        await axiosInstance.post('/documents/', formData);
      }
      setError(null);
      setSuccessMessage('Document saved successfully');
      // Show success message or redirect
      navigate('/document-management/library');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = formData.title || formData.description || formData.content;
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        navigate('/document-management/library');
      }
    } else {
      navigate('/document-management/library');
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setSubmitting(true);
      await axiosInstance.post(`/documents/${id}/submit-for-ops-review/`);
      setSuccessMessage('Document submitted for OPS review successfully');
      setTimeout(() => {
        navigate('/document-management/library');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage || 'Failed to submit for review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!document) {
    return (
      <Alert severity="error">
        Document not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/document-management/library')}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {id ? 'Document Editor' : 'Create New Document'}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          {document && (
            <Tooltip title="Download Original">
              <IconButton onClick={handleDownload} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          <Button
            variant={isPreview ? "contained" : "outlined"}
            startIcon={<PreviewIcon />}
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : (id ? 'Save' : 'Create')}
          </Button>
          {/* Show Submit for Review button for HSSE Manager on DRAFT documents */}
          {document && document.status === 'DRAFT' && user?.position === 'HSSE MANAGER' && (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitForReview}
              disabled={submitting}
              sx={{
                backgroundColor: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: theme.palette.success.dark,
                },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Document Info - Only show for existing documents */}
      {document && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Document Information
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip label={document.document_type} color="primary" variant="outlined" />
            <Chip label={document.status} color="info" />
            <Chip label={`v${document.version}`} variant="outlined" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Created by {document.created_by.name} on {new Date(document.created_at).toLocaleDateString()}
          </Typography>
        </Paper>
      )}

      {/* Editor Form */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            variant="outlined"
          />
          
          <FormControl fullWidth>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              label="Document Type"
            >
              <MenuItem value="POLICY">Policy</MenuItem>
              <MenuItem value="SYSTEM DOCUMENT">System Document</MenuItem>
              <MenuItem value="PROCEDURE">Procedure</MenuItem>
              <MenuItem value="FORM">Form</MenuItem>
              <MenuItem value="SSOW">SSOW</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            multiline
            rows={20}
            variant="outlined"
            placeholder="Enter your document content here... You can use Markdown formatting for rich text."
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Preview Mode */}
      {isPreview && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          <Box sx={{ 
            p: 2, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            backgroundColor: theme.palette.background.default,
            minHeight: 200,
          }}>
            <Typography variant="h5" gutterBottom>
              {formData.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {formData.description}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {formData.content}
            </Typography>
          </Box>
        </Paper>
      )}
      
      {/* Success Notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentEditor; 