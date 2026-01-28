import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Document {
  id: string;
  title: string;
  description: string;
  version: string;
  status: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  iso_clauses: string[];
}

interface Template {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: [] as string[],
    iso_clauses: [] as string[],
  });
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/documents/');
      console.log('API Response:', response.data); // Debug log
      
      if (!Array.isArray(response.data)) {
        console.error('API response is not an array:', response.data);
        setError('Invalid response format from server');
        return;
      }
      
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (): Promise<void> => {
    try {
      const response = await axios.get<Template[]>('/api/templates/');
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
  }, []);

  const handleOpenDialog = (document?: Document, template?: Template | null) => {
    if (document) {
      setSelectedDocument(document);
      setFormData({
        title: document.title,
        description: document.description,
        content: document.content,
        tags: document.tags,
        iso_clauses: document.iso_clauses,
      });
    } else if (template) {
      setSelectedTemplate(template);
      setFormData({
        title: template.title,
        description: template.description,
        content: template.content,
        tags: template.tags,
        iso_clauses: [],
      });
    } else {
      setSelectedDocument(null);
      setSelectedTemplate(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        tags: [],
        iso_clauses: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocument(null);
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      tags: [],
      iso_clauses: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedDocument) {
        await axios.put(`/api/documents/${selectedDocument.id}/`, formData);
      } else {
        await axios.post('/api/documents/', formData);
      }
      handleCloseDialog();
      fetchDocuments();
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`/api/documents/${id}/`);
        fetchDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document. Please try again.');
      }
    }
  };

  const handleDeleteTemplate = async (templateId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`/api/templates/${templateId}/`);
        fetchTemplates();
      } catch (err) {
        setError('Failed to delete template');
      }
    }
  };

  const handleCreateDocument = async (templateId: number): Promise<void> => {
    try {
      const response = await axios.post(`/api/templates/${templateId}/create-document/`);
      navigate(`/documents/${response.data.id}`);
    } catch (err) {
      setError('Failed to create document from template');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Document Hub</Typography>
        {activeTab === 0 ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/documents/new')}
          >
            New Document
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Template
          </Button>
        )}
      </Box>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Documents" />
        <Tab label="Templates" />
      </Tabs>

      {activeTab === 0 ? (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {document.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {document.description}
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="caption" color="textSecondary">
                      Version: {document.version}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    {document.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        style={{ marginRight: 8, marginBottom: 8 }}
                      />
                    ))}
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={document.status}
                      color={
                        document.status === 'approved'
                          ? 'success'
                          : document.status === 'pending'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(document)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(document.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {template.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleCreateDocument(template.id)}
                      title="Create Document"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(null, template)}
                      title="Edit Template"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Delete Template"
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDocument ? 'Edit Document' : selectedTemplate ? 'Edit Template' : 'Add New Document'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              margin="normal"
              multiline
              rows={6}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={formData.tags}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value as string[],
                  })
                }
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="HSSE">HSSE</MenuItem>
                <MenuItem value="Safety">Safety</MenuItem>
                <MenuItem value="Compliance">Compliance</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>ISO Clauses</InputLabel>
              <Select
                multiple
                value={formData.iso_clauses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    iso_clauses: e.target.value as string[],
                  })
                }
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="ISO 45001">ISO 45001</MenuItem>
                <MenuItem value="ISO 14001">ISO 14001</MenuItem>
                <MenuItem value="ISO 9001">ISO 9001</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedDocument ? 'Update' : selectedTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DocumentList; 