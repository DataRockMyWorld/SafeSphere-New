import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Document {
  id: string;
  title: string;
  document_type: string;
  version: string;
  revision_number: number;
  next_review_date?: string;
  expiry_date?: string;
  approved_at?: string;
  approved_by?: string;
  status: string;
  document_classification?: string;
  days_until_review?: number | null;
  is_overdue?: boolean;
}

interface ReviewScheduleData {
  statistics: {
    total_documents: number;
    with_review_dates: number;
    without_review_dates: number;
    overdue: number;
    due_soon: number;
    upcoming: number;
    later: number;
  };
  overdue: Document[];
  due_soon: Document[];
  upcoming: Document[];
  later: Document[];
  no_review_date: Document[];
}


const ReviewScheduleDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewScheduleData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newReviewDate, setNewReviewDate] = useState<Date | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReviewSchedule();
  }, []);

  const fetchReviewSchedule = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/documents/review-schedule/');
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch review schedule');
      console.error('Error fetching review schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReviewDate = (doc: Document) => {
    setSelectedDocument(doc);
    setNewReviewDate(doc.next_review_date ? new Date(doc.next_review_date) : null);
    setEditDialogOpen(true);
  };

  const handleUpdateReviewDate = async () => {
    if (!selectedDocument || !newReviewDate) return;

    try {
      setUpdating(true);
      await axiosInstance.patch(`/documents/${selectedDocument.id}/`, {
        next_review_date: newReviewDate.toISOString().split('T')[0],
      });
      setEditDialogOpen(false);
      setSelectedDocument(null);
      fetchReviewSchedule(); // Refresh data
    } catch (err: any) {
      setError('Failed to update review date');
      console.error('Error updating review date:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilColor = (days: number | null | undefined, isOverdue?: boolean) => {
    if (days === null || days === undefined) return theme.palette.text.secondary;
    if (isOverdue) return theme.palette.error.main;
    if (days <= 30) return theme.palette.warning.main;
    if (days <= 60) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  const renderDocumentTable = (documents: Document[], emptyMessage: string) => {
    if (documents.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return documents.map((doc) => (
      <TableRow key={doc.id} hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {doc.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {doc.document_type}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
            v{doc.version} (R{doc.revision_number})
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={doc.document_classification || 'Controlled'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 22 }}
          />
        </TableCell>
        <TableCell>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              color: getDaysUntilColor(doc.days_until_review, doc.is_overdue),
              fontWeight: doc.is_overdue ? 600 : 400,
            }}
          >
            {doc.days_until_review !== null && doc.days_until_review !== undefined
              ? `${doc.is_overdue ? 'Overdue by ' : ''}${Math.abs(doc.days_until_review)} day${Math.abs(doc.days_until_review) !== 1 ? 's' : ''}`
              : 'Not set'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {formatDate(doc.next_review_date)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {doc.approved_by || 'N/A'}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Document">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/document-management/library/${doc.id}`)}
                sx={{ p: 0.5 }}
              >
                <ViewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Review Date">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleEditReviewDate(doc)}
                sx={{ p: 0.5 }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Document Review Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and manage document review dates for ISO 45001 compliance
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Statistics Cards */}
      {data && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      OVERDUE REVIEWS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {data.statistics.overdue}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.contrastText }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      DUE WITHIN 30 DAYS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {data.statistics.due_soon}
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      UPCOMING (31-90 DAYS)
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {data.statistics.upcoming + data.statistics.later}
                    </Typography>
                  </Box>
                  <CalendarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.grey[200] }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      NO REVIEW DATE SET
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {data.statistics.without_review_dates}
                    </Typography>
                  </Box>
                  <DescriptionIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`Overdue (${data?.statistics.overdue || 0})`} />
            <Tab label={`Due Soon (${data?.statistics.due_soon || 0})`} />
            <Tab label={`Upcoming (${(data?.statistics.upcoming || 0) + (data?.statistics.later || 0)})`} />
            <Tab label={`No Review Date (${data?.statistics.without_review_dates || 0})`} />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Document</Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Version</Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Classification</Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Days Until Review</Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Review Date</Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Approved By</Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabValue === 0 && data && renderDocumentTable(data.overdue, 'No overdue reviews! All documents are up to date.')}
              {tabValue === 1 && data && renderDocumentTable(data.due_soon, 'No documents due for review within 30 days.')}
              {tabValue === 2 && data && renderDocumentTable([...data.upcoming, ...data.later], 'No upcoming reviews scheduled.')}
              {tabValue === 3 && data && renderDocumentTable(data.no_review_date, 'All documents have review dates set.')}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Review Date Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Review Date</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Document: <strong>{selectedDocument.title}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Current Review Date: {formatDate(selectedDocument.next_review_date)}
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="New Review Date"
                  value={newReviewDate}
                  onChange={(newValue) => setNewReviewDate(newValue)}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} size="small" sx={{ fontSize: '0.8rem', py: 0.5 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateReviewDate}
            variant="contained"
            disabled={!newReviewDate || updating}
            size="small"
            sx={{ fontSize: '0.8rem', py: 0.5 }}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewScheduleDashboard;
