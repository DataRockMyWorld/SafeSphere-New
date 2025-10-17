import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
  Stack,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Save as SaveIcon,
  CheckCircle as CompleteIcon,
  CloudUpload as UploadIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  sequence_order: number;
  question_text: string;
  expected_evidence: string;
  audit_criteria: string;
  question_type: string;
  is_mandatory: boolean;
  weight: number;
  iso_clause_detail: {
    clause_number: string;
    title: string;
  };
}

const AuditExecution: React.FC = () => {
  const theme = useTheme();
  const { auditId } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  useEffect(() => {
    if (auditId) {
      fetchChecklist();
    }
  }, [auditId]);
  
  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/audits/checklists/?audit_plan_id=${auditId}`);
      setChecklist(response.data);
    } catch (error) {
      console.error('Error fetching checklist:', error);
      showSnackbar('Failed to load audit checklist', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleNext = () => {
    if (currentStep < checklist.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleResponseChange = (itemId: string, field: string, value: any) => {
    setResponses({
      ...responses,
      [itemId]: {
        ...responses[itemId],
        [field]: value,
      },
    });
  };
  
  const saveResponse = async (itemId: string) => {
    try {
      const response = responses[itemId];
      if (!response || !response.conformity_status) {
        showSnackbar('Please select conformity status', 'error');
        return;
      }
      
      await axiosInstance.post('/audits/responses/', {
        checklist_item: itemId,
        conformity_status: response.conformity_status,
        response_value: response,
        evidence_description: response.evidence_description || '',
        notes: response.notes || '',
        interviewed_person_id: response.interviewed_person_id || null,
        location_audited: response.location || '',
      });
      
      showSnackbar('Response saved', 'success');
    } catch (error) {
      showSnackbar('Failed to save response', 'error');
    }
  };
  
  const currentItem = checklist[currentStep];
  const progress = ((currentStep + 1) / checklist.length) * 100;
  
  if (loading) {
    return <LinearProgress />;
  }
  
  if (checklist.length === 0) {
    return (
      <Alert severity="info">
        No checklist items found for this audit. Please create checklist items first.
      </Alert>
    );
  }
  
  const getConformityColor = (status: string) => {
    switch (status) {
      case 'CONFORMING':
        return theme.palette.success.main;
      case 'MINOR_NC':
        return theme.palette.warning.main;
      case 'MAJOR_NC':
        return theme.palette.error.main;
      case 'OBSERVATION':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  return (
    <Box>
      {/* Progress Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Audit Execution
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Question {currentStep + 1} of {checklist.length}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {progress.toFixed(0)}% Complete
        </Typography>
      </Paper>
      
      {/* Current Question */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* ISO Clause */}
          <Chip
            label={`${currentItem.iso_clause_detail.clause_number}: ${currentItem.iso_clause_detail.title}`}
            sx={{
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          />
          
          {/* Question */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
            {currentItem.question_text}
            {currentItem.is_mandatory && (
              <Chip label="MANDATORY" size="small" color="error" sx={{ ml: 1 }} />
            )}
          </Typography>
          
          {/* Expected Evidence */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Expected Evidence:
            </Typography>
            <Typography variant="body2">
              {currentItem.expected_evidence}
            </Typography>
          </Alert>
          
          {/* Audit Criteria */}
          <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Audit Criteria:
            </Typography>
            <Typography variant="body2">
              {currentItem.audit_criteria}
            </Typography>
          </Box>
          
          {/* Conformity Assessment */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Conformity Assessment *
          </Typography>
          <RadioGroup
            value={responses[currentItem.id]?.conformity_status || ''}
            onChange={(e) => handleResponseChange(currentItem.id, 'conformity_status', e.target.value)}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    border: `2px solid ${
                      responses[currentItem.id]?.conformity_status === 'CONFORMING'
                        ? theme.palette.success.main
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.02) },
                  }}
                  onClick={() => handleResponseChange(currentItem.id, 'conformity_status', 'CONFORMING')}
                >
                  <FormControlLabel
                    value="CONFORMING"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ✓ Conforming
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fully complies
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    border: `2px solid ${
                      responses[currentItem.id]?.conformity_status === 'MINOR_NC'
                        ? theme.palette.warning.main
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.02) },
                  }}
                  onClick={() => handleResponseChange(currentItem.id, 'conformity_status', 'MINOR_NC')}
                >
                  <FormControlLabel
                    value="MINOR_NC"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ⚠ Minor NC
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Minor issue
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    border: `2px solid ${
                      responses[currentItem.id]?.conformity_status === 'MAJOR_NC'
                        ? theme.palette.error.main
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.02) },
                  }}
                  onClick={() => handleResponseChange(currentItem.id, 'conformity_status', 'MAJOR_NC')}
                >
                  <FormControlLabel
                    value="MAJOR_NC"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ✕ Major NC
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Significant issue
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    border: `2px solid ${
                      responses[currentItem.id]?.conformity_status === 'OBSERVATION'
                        ? theme.palette.info.main
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.02) },
                  }}
                  onClick={() => handleResponseChange(currentItem.id, 'conformity_status', 'OBSERVATION')}
                >
                  <FormControlLabel
                    value="OBSERVATION"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ℹ Observation
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          For improvement
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    border: `2px solid ${
                      responses[currentItem.id]?.conformity_status === 'N_A'
                        ? theme.palette.grey[500]
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.02) },
                  }}
                  onClick={() => handleResponseChange(currentItem.id, 'conformity_status', 'N_A')}
                >
                  <FormControlLabel
                    value="N_A"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          N/A
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Not applicable
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </RadioGroup>
          
          {/* Additional Fields */}
          {responses[currentItem.id]?.conformity_status && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Additional Information
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Evidence Description"
                  value={responses[currentItem.id]?.evidence_description || ''}
                  onChange={(e) => handleResponseChange(currentItem.id, 'evidence_description', e.target.value)}
                  placeholder="Describe the evidence found or observations made..."
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={responses[currentItem.id]?.notes || ''}
                  onChange={(e) => handleResponseChange(currentItem.id, 'notes', e.target.value)}
                  placeholder="Additional notes or comments..."
                />
                
                <TextField
                  fullWidth
                  label="Location Audited"
                  value={responses[currentItem.id]?.location || ''}
                  onChange={(e) => handleResponseChange(currentItem.id, 'location', e.target.value)}
                  placeholder="e.g., Workshop A, Office Block 2..."
                />
                
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  component="label"
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Attach Evidence
                  <input type="file" hidden multiple />
                </Button>
              </Stack>
            </Box>
          )}
          
          {/* Log Finding Button */}
          {responses[currentItem.id]?.conformity_status && 
           ['MAJOR_NC', 'MINOR_NC'].includes(responses[currentItem.id]?.conformity_status) && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  Non-conformity identified. Log a formal finding?
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ErrorIcon />}
                  color="error"
                >
                  Log Finding
                </Button>
              </Box>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            startIcon={<PrevIcon />}
          >
            Previous
          </Button>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => saveResponse(currentItem.id)}
            >
              Save Response
            </Button>
            
            {currentStep === checklist.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<CompleteIcon />}
              >
                Complete Audit
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next Question
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditExecution;

