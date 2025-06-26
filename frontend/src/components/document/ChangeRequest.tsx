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
  useTheme,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  status: string;
  version: string;
  created_by: {
    id: number;
    name: string;
  };
}

const ChangeRequest: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    reason: '',
  });

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/documents/${id}/`);
      setDocument(response.data);
    } catch (err) {
      setError('Failed to fetch document');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      setError('Please provide a reason for the change request');
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/documents/change-requests/', {
        document_id: id,
        reason: formData.reason,
      });
      setSuccess('Change request submitted successfully');
      setTimeout(() => {
        navigate('/document-management/library');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage || 'Failed to submit change request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/document-management/library');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !document) {
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
            onClick={handleCancel}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Request Document Change
          </Typography>
        </Box>
      </Box>

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Document Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Document Information
        </Typography>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">{document.title}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              {document.description}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip label={document.document_type} color="primary" variant="outlined" />
              <Chip label={document.status} color="info" />
              <Chip label={`v${document.version}`} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Created by {document.created_by.name}
            </Typography>
          </CardContent>
        </Card>
      </Paper>

      {/* Change Request Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Request Details
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please provide a detailed reason for the requested changes to this document. 
          Your request will be reviewed by the HSSE Manager.
        </Typography>
        
        <TextField
          fullWidth
          label="Reason for Change Request"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          multiline
          rows={6}
          variant="outlined"
          placeholder="Please describe the changes you would like to see in this document and why they are needed..."
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={submitting || !formData.reason.trim()}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Change Request'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangeRequest; 