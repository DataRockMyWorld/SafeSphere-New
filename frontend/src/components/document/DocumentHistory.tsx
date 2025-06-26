import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  status: string;
  version: string;
  revision_number: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
  };
  verified_by?: {
    id: number;
    name: string;
  };
  approved_by?: {
    id: number;
    name: string;
  };
  verified_at?: string;
  approved_at?: string;
  rejection_reason?: string;
}

interface WorkflowHistory {
  id: number;
  document: string;
  position: string;
  action: string;
  performed_by: {
    id: number;
    name: string;
  };
  timestamp: string;
  comment: string;
}

const DocumentHistory: React.FC = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/documents/');
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowHistory = async (documentId: string) => {
    try {
      setHistoryLoading(true);
      const response = await axiosInstance.get(`/documents/${documentId}/workflow-history/`);
      setWorkflowHistory(response.data);
    } catch (err) {
      console.error('Error fetching workflow history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    fetchWorkflowHistory(document.id);
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

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'SUBMIT':
        return theme.palette.info.main;
      case 'VERIFY':
        return theme.palette.warning.main;
      case 'APPROVE':
        return theme.palette.success.main;
      case 'REJECT':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Document History
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* Documents List */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Documents
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow 
                    key={document.id} 
                    hover
                    onClick={() => handleDocumentSelect(document)}
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedDocument?.id === document.id ? theme.palette.action.selected : 'inherit',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
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
                    <TableCell>
                      {formatDate(document.updated_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Document Details and History */}
        <Box sx={{ flex: 1 }}>
          {selectedDocument ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Document Details & History
              </Typography>
              
              {/* Document Info Card */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DocumentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">{selectedDocument.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedDocument.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
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

                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
                </CardContent>
              </Card>

              {/* Workflow History */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Workflow History</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {historyLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : workflowHistory.length > 0 ? (
                    <Box sx={{ position: 'relative' }}>
                      {workflowHistory.map((item, index) => (
                        <Box key={item.id} sx={{ display: 'flex', mb: 3 }}>
                          {/* Timeline line */}
                          <Box sx={{ position: 'relative', mr: 2 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getActionColor(item.action),
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                zIndex: 1,
                                position: 'relative',
                              }}
                            />
                            {index < workflowHistory.length - 1 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: '5px',
                                  top: '12px',
                                  width: '2px',
                                  height: 'calc(100% + 12px)',
                                  backgroundColor: theme.palette.divider,
                                }}
                              />
                            )}
                          </Box>
                          
                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="span">
                              {item.action}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {item.performed_by.name} ({item.position})
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(item.timestamp)}
                            </Typography>
                            {item.comment && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                "{item.comment}"
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No workflow history available
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select a document to view its history
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click on any document from the list to see its complete workflow history and version information.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentHistory; 