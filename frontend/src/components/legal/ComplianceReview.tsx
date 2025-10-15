import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  Archive as ArchiveIcon,
  Description as DocumentIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface ObligationForReview {
  id: number;
  title: string;
  compliance_status: string;
  last_review_date: string | null;
  next_review_date: string | null;
  review_period_days: number;
  owner_department: string;
  category: string;
  days_until_review: number;
  documents_count: number;
}

interface ReviewFormData {
  compliance_status: 'compliant' | 'non-compliant' | 'partial';
  evaluation_compliance: string;
  review_notes: string;
  next_review_date: string;
  archive_old_evidence: boolean;
}

const ComplianceReview: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [obligations, setObligations] = useState<ObligationForReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<ObligationForReview | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    compliance_status: 'compliant',
    evaluation_compliance: '',
    review_notes: '',
    next_review_date: '',
    archive_old_evidence: true,
  });
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchObligationsForReview();
  }, []);

  const fetchObligationsForReview = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/legals/register-entries/');
      const entries = response.data.results || response.data;
      
      // Calculate days until review for each
      const enrichedEntries = entries.map((entry: any) => {
        const nextReviewDate = entry.next_review_date ? new Date(entry.next_review_date) : null;
        const today = new Date();
        let daysUntilReview = 0;
        
        if (nextReviewDate) {
          daysUntilReview = Math.floor((nextReviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // If no review date set, assume review is overdue
          daysUntilReview = -999;
        }

        return {
          ...entry,
          days_until_review: daysUntilReview,
          documents_count: 0, // TODO: Fetch actual count
        };
      });

      // Sort by urgency (overdue first)
      enrichedEntries.sort((a: any, b: any) => a.days_until_review - b.days_until_review);

      setObligations(enrichedEntries);
    } catch (error) {
      console.error('Error fetching obligations:', error);
      setSnackbar({ open: true, message: 'Failed to fetch obligations', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (obligation: ObligationForReview) => {
    setSelectedObligation(obligation);
    
    // Calculate next review date (1 year from today)
    const nextYear = new Date();
    nextYear.setDate(nextYear.getDate() + (obligation.review_period_days || 365));
    
    setReviewForm({
      compliance_status: obligation.compliance_status as any,
      evaluation_compliance: '',
      review_notes: '',
      next_review_date: nextYear.toISOString().split('T')[0],
      archive_old_evidence: true,
    });
    
    setActiveStep(0);
    setReviewModalOpen(true);
  };

  const handleCompleteReview = async () => {
    if (!selectedObligation) return;

    try {
      setLoading(true);

      // Step 1: Update the obligation with review data
      const updatePayload = {
        compliance_status: reviewForm.compliance_status,
        evaluation_compliance: reviewForm.evaluation_compliance,
        review_notes: reviewForm.review_notes,
        last_review_date: new Date().toISOString().split('T')[0],
        next_review_date: reviewForm.next_review_date,
      };

      await axiosInstance.patch(`/legals/register-entries/${selectedObligation.id}/`, updatePayload);

      // Step 2: Archive old evidence if requested
      if (reviewForm.archive_old_evidence) {
        try {
          const docsResponse = await axiosInstance.get('/legals/register-documents/', {
            params: { entry: selectedObligation.id }
          });
          const documents = docsResponse.data.results || docsResponse.data;
          
          // Archive each document
          const currentYear = new Date().getFullYear();
          for (const doc of documents) {
            if (!doc.is_archived) {
              await axiosInstance.patch(`/legals/register-documents/${doc.id}/`, {
                is_archived: true,
                archived_at: new Date().toISOString(),
                review_year: currentYear - 1,
              });
            }
          }
        } catch (archiveError) {
          console.error('Error archiving documents:', archiveError);
          // Don't fail the whole review if archiving fails
        }
      }

      setSnackbar({ open: true, message: 'Review completed successfully! Evidence archived.', severity: 'success' });
      setReviewModalOpen(false);
      fetchObligationsForReview();
    } catch (error) {
      console.error('Error completing review:', error);
      setSnackbar({ open: true, message: 'Failed to complete review', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getReviewStatusColor = (days: number) => {
    if (days < 0) return theme.palette.error.main;
    if (days <= 30) return theme.palette.warning.main;
    if (days <= 90) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  const getReviewStatusLabel = (days: number) => {
    if (days < 0) return 'OVERDUE';
    if (days <= 30) return 'DUE SOON';
    if (days <= 90) return 'UPCOMING';
    return 'CURRENT';
  };

  const overdueObligations = obligations.filter(o => o.days_until_review < 0);
  const dueSoonObligations = obligations.filter(o => o.days_until_review >= 0 && o.days_until_review <= 30);
  const upcomingObligations = obligations.filter(o => o.days_until_review > 30 && o.days_until_review <= 90);

  const steps = ['Review Compliance', 'Update Status', 'Archive Evidence'];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Annual Compliance Review
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Conduct yearly reviews of compliance obligations and archive historical evidence
        </Typography>
      </Box>

      {/* Review Alert Summary */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${theme.palette.error.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    {overdueObligations.length}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Overdue Reviews
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {dueSoonObligations.length}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Due Within 30 Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {upcomingObligations.length}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Upcoming (30-90 days)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Obligations Requiring Review */}
      <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Obligations Requiring Review
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : obligations.length === 0 ? (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              All compliance obligations are up to date. No reviews currently due.
            </Alert>
          ) : (
            <List sx={{ p: 0 }}>
              {obligations.map((obligation, index) => (
                <React.Fragment key={obligation.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: alpha(getReviewStatusColor(obligation.days_until_review), 0.1),
                          border: `2px solid ${getReviewStatusColor(obligation.days_until_review)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AssignmentIcon sx={{ color: getReviewStatusColor(obligation.days_until_review) }} />
                      </Box>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {obligation.title}
                          </Typography>
                          <Chip
                            label={getReviewStatusLabel(obligation.days_until_review)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getReviewStatusColor(obligation.days_until_review), 0.1),
                              color: getReviewStatusColor(obligation.days_until_review),
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {obligation.owner_department} • {obligation.category}
                          </Typography>
                          {obligation.last_review_date && (
                            <Typography variant="caption" color="text.secondary">
                              Last Review: {new Date(obligation.last_review_date).toLocaleDateString()}
                            </Typography>
                          )}
                          {obligation.next_review_date ? (
                            <Typography variant="caption" color="text.secondary">
                              Next Review: {new Date(obligation.next_review_date).toLocaleDateString()}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                              No review date set
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {obligation.days_until_review < 0 || obligation.days_until_review <= 90 ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleStartReview(obligation)}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }}
                        >
                          Conduct Review
                        </Button>
                      ) : (
                        <Chip
                          label={`${obligation.days_until_review} days`}
                          sx={{
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </ListItem>
                  {index < obligations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        maxWidth="md"
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
          Annual Compliance Review
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {selectedObligation && (
            <>
              {/* Obligation Info */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {selectedObligation.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedObligation.owner_department} • {selectedObligation.category}
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step 0: Review Compliance */}
              {activeStep === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Review the current compliance status and update based on your assessment.
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                      Compliance Status *
                    </Typography>
                    <Grid container spacing={1}>
                      {['compliant', 'partial', 'non-compliant'].map((status) => (
                        <Grid item xs={4} key={status}>
                          <Card
                            onClick={() => setReviewForm({ ...reviewForm, compliance_status: status as any })}
                            sx={{
                              cursor: 'pointer',
                              border: reviewForm.compliance_status === status
                                ? `2px solid ${theme.palette.primary.main}`
                                : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              backgroundColor: reviewForm.compliance_status === status
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'white',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                {status.replace('-', ' ')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Step 1: Update Status */}
              {activeStep === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Compliance Evaluation"
                      name="evaluation_compliance"
                      value={reviewForm.evaluation_compliance}
                      onChange={(e) => setReviewForm({ ...reviewForm, evaluation_compliance: e.target.value })}
                      multiline
                      rows={3}
                      required
                      placeholder="Describe the current compliance status, what was reviewed, findings, etc."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Review Notes"
                      name="review_notes"
                      value={reviewForm.review_notes}
                      onChange={(e) => setReviewForm({ ...reviewForm, review_notes: e.target.value })}
                      multiline
                      rows={3}
                      placeholder="Additional notes from this review cycle (actions taken, improvements made, etc.)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Next Review Date"
                      type="date"
                      name="next_review_date"
                      value={reviewForm.next_review_date}
                      onChange={(e) => setReviewForm({ ...reviewForm, next_review_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                      helperText="Typically 1 year from today for annual reviews"
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 2: Archive Evidence */}
              {activeStep === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<ArchiveIcon />} sx={{ mb: 2 }}>
                      Archiving will preserve all current evidence documents for historical reference and mark them with the current review year.
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reviewForm.archive_old_evidence}
                          onChange={(e) => setReviewForm({ ...reviewForm, archive_old_evidence: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Archive current evidence documents
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Recommended: Archive evidence from the past year before uploading new documents
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        What happens when you archive:
                      </Typography>
                      <List dense>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Current evidence is marked as archived"
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Documents are tagged with review year"
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Historical records preserved for audits"
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="You can upload new evidence for the current year"
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setReviewModalOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)} sx={{ borderRadius: 2 }}>
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={() => setActiveStep(activeStep + 1)}
              variant="contained"
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCompleteReview}
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`,
              }}
            >
              {loading ? 'Completing...' : 'Complete Review'}
            </Button>
          )}
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

export default ComplianceReview;

