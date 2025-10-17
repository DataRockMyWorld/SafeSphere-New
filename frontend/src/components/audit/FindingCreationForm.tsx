import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  IconButton,
  Alert,
  LinearProgress,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../utils/axiosInstance';
import AuditScoreCard from './AuditScoreCard';
import ScoringCriteriaGuide from './ScoringCriteriaGuide';

interface AuditPlan {
  id: string;
  audit_code: string;
  title: string;
  audit_type: number;
  audit_type_name: string;
}

interface ISOClause {
  id: number;
  clause_number: string;
  title: string;
}

interface Question {
  id: number;
  subsection_name: string;
  reference_number: string;
  question_letter: string;
  question_text: string;
  expected_response_type: string;
  is_mandatory: boolean;
  full_reference: string;
  help_text: string;
}

interface Category {
  id: number;
  section_number: number;
  category_name: string;
  description: string;
  questions: Question[];
}

interface Template {
  id: number;
  name: string;
  audit_type: number;
  categories: Category[];
  total_questions: number;
}

interface QuestionResponse {
  question_id: number;
  answer_text: string;
  compliance_status: string;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FindingCreationForm: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  
  // Basic information
  const [auditPlans, setAuditPlans] = useState<AuditPlan[]>([]);
  const [isoClauses, setIsoClauses] = useState<ISOClause[]>([]);
  const [selectedAuditPlan, setSelectedAuditPlan] = useState<AuditPlan | null>(null);
  const [selectedISOClause, setSelectedISOClause] = useState<ISOClause | null>(null);
  const [auditDate, setAuditDate] = useState<Date | null>(new Date());
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  
  // Template and questions
  const [template, setTemplate] = useState<Template | null>(null);
  const [responses, setResponses] = useState<Record<number, QuestionResponse>>({});
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Finding details
  const [findingTitle, setFindingTitle] = useState('');
  const [findingType, setFindingType] = useState('MAJOR_NC');
  const [severity, setSeverity] = useState('HIGH');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  
  // Scoring
  const [scoreData, setScoreData] = useState<any>(null);
  const [showCriteriaGuide, setShowCriteriaGuide] = useState(false);
  
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);
  
  useEffect(() => {
    if (selectedAuditPlan) {
      fetchTemplate(selectedAuditPlan.audit_type);
    }
  }, [selectedAuditPlan]);
  
  useEffect(() => {
    // Recalculate score whenever responses change
    if (template) {
      calculateScore();
    }
  }, [responses, template]);
  
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [plansRes, clausesRes] = await Promise.all([
        axiosInstance.get('/audits/plans/'),  // Get all audit plans
        axiosInstance.get('/audits/iso-clauses/'),
      ]);
      
      setAuditPlans(plansRes.data);
      setIsoClauses(clausesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTemplate = async (auditTypeId: number) => {
    try {
      setLoading(true);
      console.log('Fetching template for audit type ID:', auditTypeId);
      const response = await axiosInstance.get(`/audits/templates/?audit_type_id=${auditTypeId}`);
      
      console.log('Template response:', response.data);
      
      if (response.data && response.data.length > 0) {
        const templateData = response.data[0];
        setTemplate(templateData);
        
        console.log('Template loaded:', templateData.name);
        console.log('Categories:', templateData.categories.length);
        console.log('Total questions:', templateData.total_questions);
        
        // Expand all categories by default
        setExpandedCategories(templateData.categories.map((cat: Category) => cat.id));
        
        // Initialize responses
        const initialResponses: Record<number, QuestionResponse> = {};
        templateData.categories.forEach((category: Category) => {
          category.questions.forEach((question: Question) => {
            initialResponses[question.id] = {
              question_id: question.id,
              answer_text: '',
              compliance_status: 'COMPLIANT',
              notes: '',
            };
          });
        });
        setResponses(initialResponses);
        
        console.log('Initialized responses for', Object.keys(initialResponses).length, 'questions');
      } else {
        console.warn('No template found for audit type ID:', auditTypeId);
        setTemplate(null);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
      setAttendees([...attendees, attendeeInput.trim()]);
      setAttendeeInput('');
    }
  };
  
  const handleRemoveAttendee = (attendee: string) => {
    setAttendees(attendees.filter(a => a !== attendee));
  };
  
  const handleToggleCategory = (categoryId: number) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  const handleResponseChange = (questionId: number, field: keyof QuestionResponse, value: string) => {
    setResponses({
      ...responses,
      [questionId]: {
        ...responses[questionId],
        [field]: value,
      },
    });
  };
  
  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'NON_COMPLIANT':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      case 'OBSERVATION':
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
      case 'NOT_APPLICABLE':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.grey[500] }} />;
      default:
        return null;
    }
  };
  
  const getNonCompliantResponses = () => {
    return Object.values(responses).filter(
      r => r.compliance_status === 'NON_COMPLIANT' || r.compliance_status === 'OBSERVATION'
    );
  };
  
  const calculateScore = () => {
    if (!template || !template.categories) {
      setScoreData(null);
      return;
    }
    
    // Scoring map
    const complianceScores: Record<string, number> = {
      'COMPLIANT': 100,
      'OPPORTUNITY': 90,
      'OBSERVATION': 90,
      'NON_COMPLIANT': 0,
      'NOT_APPLICABLE': 100,
    };
    
    const categoryScores: Record<string, any> = {};
    let totalWeightedScore = 0;
    let totalCategoryWeight = 0;
    
    template.categories.forEach((category) => {
      // Calculate category score
      let categoryScore = 0;
      let totalQuestionWeight = 0;
      
      category.questions.forEach((question) => {
        const response = responses[question.id];
        if (response) {
          const questionScore = complianceScores[response.compliance_status] || 100;
          const questionWeight = question.weight || 0;
          categoryScore += (questionScore * questionWeight) / 100;
          totalQuestionWeight += questionWeight;
        }
      });
      
      // Normalize if total weight isn't exactly 100
      if (totalQuestionWeight > 0 && Math.abs(totalQuestionWeight - 100) > 0.01) {
        categoryScore = (categoryScore / totalQuestionWeight) * 100;
      }
      
      const categoryWeight = category.weight || 0;
      const weightedContribution = (categoryScore * categoryWeight) / 100;
      
      categoryScores[category.id] = {
        name: category.category_name,
        score: categoryScore,
        weight: categoryWeight,
        weighted_contribution: weightedContribution,
      };
      
      totalWeightedScore += weightedContribution;
      totalCategoryWeight += categoryWeight;
    });
    
    // Normalize overall score if needed
    if (totalCategoryWeight > 0 && Math.abs(totalCategoryWeight - 100) > 0.01) {
      totalWeightedScore = (totalWeightedScore / totalCategoryWeight) * 100;
    }
    
    // Determine grade and color
    let grade = 'FAIL';
    let color = 'RED';
    
    if (totalWeightedScore >= 80) {
      grade = 'DISTINCTION';
      color = 'GREEN';
    } else if (totalWeightedScore >= 50) {
      grade = 'PASS';
      color = 'AMBER';
    }
    
    setScoreData({
      overall_score: totalWeightedScore,
      grade,
      color,
      category_scores: categoryScores,
      total_questions_answered: Object.values(responses).filter(r => r.answer_text).length,
    });
  };
  
  const handleSubmit = async () => {
    try {
      if (!selectedAuditPlan || !selectedISOClause) {
        alert('Please select audit plan and ISO clause');
        return;
      }
      
      if (!findingTitle || !department) {
        alert('Please provide finding title and department');
        return;
      }
      
      setSubmitting(true);
      
      // Prepare question responses
      const questionResponsesData = Object.values(responses)
        .filter(r => r.answer_text.trim() || r.compliance_status !== 'COMPLIANT')
        .map(r => ({
          question_id: r.question_id,
          answer_text: r.answer_text,
          compliance_status: r.compliance_status,
          notes: r.notes,
          evidence_files: []
        }));
      
      const payload = {
        audit_plan_id: selectedAuditPlan.id,
        iso_clause_id: selectedISOClause.id,
        audit_date: auditDate?.toISOString().split('T')[0],
        attendees: attendees,
        finding_type: findingType,
        severity: severity,
        title: findingTitle,
        description: description,
        department_affected: department,
        impact_assessment: 'OPERATIONAL',
        risk_level: severity === 'CRITICAL' ? 9 : severity === 'HIGH' ? 7 : severity === 'MEDIUM' ? 5 : 3,
        requires_immediate_action: severity === 'CRITICAL',
        question_responses_data: questionResponsesData,
      };
      
      await axiosInstance.post('/audits/findings/', payload);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating finding:', error);
      alert(error.response?.data?.error || 'Failed to create finding');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleClose = () => {
    // Reset form
    setSelectedAuditPlan(null);
    setSelectedISOClause(null);
    setAuditDate(new Date());
    setAttendees([]);
    setTemplate(null);
    setResponses({});
    setFindingTitle('');
    setDescription('');
    setDepartment('');
    onClose();
  };
  
  const nonCompliantCount = getNonCompliantResponses().length;
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                <ErrorIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Log Audit Finding
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Document non-conformities and observations
                </Typography>
              </Box>
            </Stack>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => setShowCriteriaGuide(true)}
              sx={{ minWidth: 140 }}
            >
              Scoring Guide
            </Button>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Main Form */}
            <Box sx={{ flex: 1 }}>
              <Stack spacing={3}>
            {/* Basic Information Section */}
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" fontSize="small" />
                Basic Information
              </Typography>
              
              <Stack spacing={2.5}>
                <Autocomplete
                  options={auditPlans}
                  getOptionLabel={(option) => `${option.audit_code} - ${option.title}`}
                  value={selectedAuditPlan}
                  onChange={(_, newValue) => setSelectedAuditPlan(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Audit Plan" required />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.audit_code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.title} ({option.audit_type_name})
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="Audit Date"
                    value={auditDate}
                    onChange={(date) => setAuditDate(date)}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                  
                  <Autocomplete
                    options={isoClauses}
                    getOptionLabel={(option) => `${option.clause_number} - ${option.title}`}
                    value={selectedISOClause}
                    onChange={(_, newValue) => setSelectedISOClause(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="ISO Clause" required />
                    )}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                
                {/* Attendees */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon fontSize="small" color="action" />
                    Attendees
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter attendee name..."
                      value={attendeeInput}
                      onChange={(e) => setAttendeeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAttendee();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddAttendee}
                      startIcon={<AddIcon />}
                      sx={{ minWidth: 100 }}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {attendees.map((attendee, index) => (
                      <Chip
                        key={index}
                        label={attendee}
                        onDelete={() => handleRemoveAttendee(attendee)}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>
            </Paper>
            
            {/* Finding Summary Section */}
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.02) }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" fontSize="small" />
                Finding Summary
              </Typography>
              
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Finding Title"
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                  required
                  placeholder="Brief summary of the finding..."
                />
                
                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth required>
                    <InputLabel>Finding Type</InputLabel>
                    <Select
                      value={findingType}
                      label="Finding Type"
                      onChange={(e) => setFindingType(e.target.value)}
                    >
                      <MenuItem value="MAJOR_NC">Major Non-Conformity</MenuItem>
                      <MenuItem value="MINOR_NC">Minor Non-Conformity</MenuItem>
                      <MenuItem value="OBSERVATION">Observation</MenuItem>
                      <MenuItem value="OPPORTUNITY">Opportunity for Improvement</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth required>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={severity}
                      label="Severity"
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <MenuItem value="CRITICAL">Critical</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="LOW">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                
                <TextField
                  fullWidth
                  label="Department Affected"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Finding Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the finding..."
                />
              </Stack>
            </Paper>
            
            {/* Checklist Questions */}
            {template && (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Audit Checklist
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.name} • {template.total_questions} questions • {template.categories.length} categories
                    </Typography>
                  </Box>
                  
                  {nonCompliantCount > 0 && (
                    <Chip
                      label={`${nonCompliantCount} Non-Compliant`}
                      color="error"
                      size="small"
                      icon={<ErrorIcon />}
                    />
                  )}
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Answer each question and mark compliance status. Questions marked as non-compliant will be documented in the finding.
                </Alert>
                
                <Stack spacing={2}>
                  {template.categories.map((category) => (
                    <Accordion
                      key={category.id}
                      expanded={expandedCategories.includes(category.id)}
                      onChange={() => handleToggleCategory(category.id)}
                      sx={{
                        borderRadius: 2,
                        '&:before': { display: 'none' },
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          borderRadius: 2,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {category.section_number}. {category.category_name}
                          </Typography>
                          <Chip
                            label={`${category.questions.length} questions`}
                            size="small"
                            sx={{ ml: 'auto', mr: 2 }}
                          />
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails sx={{ p: 3 }}>
                        <Stack spacing={3}>
                          {/* Group questions by subsection */}
                          {Object.entries(
                            category.questions.reduce((acc, q) => {
                              const key = q.subsection_name || 'General';
                              if (!acc[key]) acc[key] = [];
                              acc[key].push(q);
                              return acc;
                            }, {} as Record<string, Question[]>)
                          ).map(([subsectionName, questions]) => (
                            <Box key={subsectionName}>
                              {subsectionName !== 'General' && (
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 600,
                                    color: theme.palette.text.secondary,
                                    mb: 2,
                                    pl: 1,
                                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                                  }}
                                >
                                  {questions[0].reference_number} {subsectionName}
                                </Typography>
                              )}
                              
                              <Stack spacing={2.5}>
                                {questions.map((question) => (
                                  <Paper
                                    key={question.id}
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      border: `1px solid ${
                                        responses[question.id]?.compliance_status === 'NON_COMPLIANT'
                                          ? alpha(theme.palette.error.main, 0.3)
                                          : responses[question.id]?.compliance_status === 'OBSERVATION'
                                          ? alpha(theme.palette.info.main, 0.3)
                                          : alpha(theme.palette.divider, 0.1)
                                      }`,
                                      bgcolor: responses[question.id]?.compliance_status === 'NON_COMPLIANT'
                                        ? alpha(theme.palette.error.main, 0.02)
                                        : responses[question.id]?.compliance_status === 'OBSERVATION'
                                        ? alpha(theme.palette.info.main, 0.02)
                                        : 'transparent',
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 500,
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                      }}
                                    >
                                      <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 600, minWidth: 30 }}>
                                        {question.full_reference})
                                      </Box>
                                      {question.question_text}
                                    </Typography>
                                    
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={2}
                                      size="small"
                                      placeholder="Enter response..."
                                      value={responses[question.id]?.answer_text || ''}
                                      onChange={(e) => handleResponseChange(question.id, 'answer_text', e.target.value)}
                                      sx={{ mb: 1.5 }}
                                    />
                                    
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <FormControl size="small" sx={{ minWidth: 200 }}>
                                        <InputLabel>Compliance Status</InputLabel>
                                        <Select
                                          value={responses[question.id]?.compliance_status || 'COMPLIANT'}
                                          label="Compliance Status"
                                          onChange={(e) => handleResponseChange(question.id, 'compliance_status', e.target.value)}
                                          startAdornment={getComplianceIcon(responses[question.id]?.compliance_status || 'COMPLIANT')}
                                        >
                                          <MenuItem value="COMPLIANT">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                                              <span>Compliant</span>
                                            </Stack>
                                          </MenuItem>
                                          <MenuItem value="NON_COMPLIANT">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                                              <span>Non-Compliant</span>
                                            </Stack>
                                          </MenuItem>
                                          <MenuItem value="OBSERVATION">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
                                              <span>Observation</span>
                                            </Stack>
                                          </MenuItem>
                                          <MenuItem value="NOT_APPLICABLE">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <WarningIcon fontSize="small" sx={{ color: theme.palette.grey[500] }} />
                                              <span>Not Applicable</span>
                                            </Stack>
                                          </MenuItem>
                                        </Select>
                                      </FormControl>
                                      
                                      <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Additional notes (optional)..."
                                        value={responses[question.id]?.notes || ''}
                                        onChange={(e) => handleResponseChange(question.id, 'notes', e.target.value)}
                                      />
                                    </Stack>
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Paper>
            )}
            
            {!template && selectedAuditPlan && (
              <Alert severity="warning">
                No checklist template found for {selectedAuditPlan.audit_type_name}. 
                You can still create a finding manually.
              </Alert>
            )}
              </Stack>
            </Box>
            
            {/* Score Card Sidebar */}
            {template && scoreData && (
              <Box sx={{ width: 320, flexShrink: 0 }}>
                <Box sx={{ position: 'sticky', top: 16 }}>
                  <AuditScoreCard
                    scoreData={scoreData}
                    totalQuestions={template.total_questions}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {nonCompliantCount > 0 && (
              <Chip
                label={`${nonCompliantCount} non-compliant items will be documented`}
                color="error"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedAuditPlan || !selectedISOClause || !findingTitle || submitting}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {submitting ? 'Creating...' : 'Create Finding'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Scoring Criteria Guide */}
      <ScoringCriteriaGuide
        open={showCriteriaGuide}
        onClose={() => setShowCriteriaGuide(false)}
      />
    </LocalizationProvider>
  );
};

export default FindingCreationForm;

