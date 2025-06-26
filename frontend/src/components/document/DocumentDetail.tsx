import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Document {
  id: number;
  title: string;
  description: string;
  document_type: string;
  status: string;
  version: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
  verified_by: number | null;
  verified_by_name: string | null;
  verified_at: string | null;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
}

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async (): Promise<void> => {
    try {
      const response = await axios.get<Document>(`/api/documents/${id}/`);
      setDocument(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch document');
      setLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`/api/documents/${id}/`);
        navigate('/documents');
      } catch (err) {
        setError('Failed to delete document');
      }
    }
  };

  const handleVerify = async (): Promise<void> => {
    try {
      await axios.post(`/api/documents/verify/`, { document_id: id });
      fetchDocument();
    } catch (err) {
      setError('Failed to verify document');
    }
  };

  const handleApprove = async (): Promise<void> => {
    try {
      await axios.post(`/api/documents/approve/`, { document_id: id });
      fetchDocument();
    } catch (err) {
      setError('Failed to approve document');
    }
  };

  const handleReject = async (): Promise<void> => {
    const reason = window.prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await axios.post(`/api/documents/reject/`, {
          document_id: id,
          reason,
        });
        fetchDocument();
      } catch (err) {
        setError('Failed to reject document');
      }
    }
  };

  if (loading) return <Typography>Loading document...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!document) return <Alert severity="error">Document not found</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/documents')}
        >
          Back to Documents
        </Button>
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/documents/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {document.title}
        </Typography>
        <Typography color="textSecondary" paragraph>
          {document.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Chip
            label={document.document_type}
            sx={{ mr: 1 }}
          />
          <Chip
            label={document.status}
            color={
              document.status === 'APPROVED'
                ? 'success'
                : document.status === 'REJECTED'
                ? 'error'
                : 'default'
            }
            sx={{ mr: 1 }}
          />
          <Chip
            label={`v${document.version}`}
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Created By
            </Typography>
            <Typography>{document.created_by_name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(document.created_at).toLocaleString()}
            </Typography>
          </Grid>

          {document.verified_by && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Verified By
              </Typography>
              <Typography>{document.verified_by_name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(document.verified_at!).toLocaleString()}
              </Typography>
            </Grid>
          )}

          {document.approved_by && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Approved By
              </Typography>
              <Typography>{document.approved_by_name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(document.approved_at!).toLocaleString()}
              </Typography>
            </Grid>
          )}

          {document.rejection_reason && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="error">
                Rejection Reason
              </Typography>
              <Typography color="error">{document.rejection_reason}</Typography>
            </Grid>
          )}
        </Grid>

        {document.status === 'DRAFT' && user?.position === 'OPS MANAGER' && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleVerify}
            >
              Verify Document
            </Button>
          </Box>
        )}

        {document.status === 'VERIFICATION' && user?.position === 'MD' && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleApprove}
              sx={{ mr: 2 }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleReject}
            >
              Reject
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DocumentDetail; 