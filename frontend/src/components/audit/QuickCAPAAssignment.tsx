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
  Box,
  Typography,
  Stack,
  Alert,
  Chip,
  Paper,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as CAPAIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';

interface Finding {
  id: string;
  finding_code: string;
  title: string;
  finding_type: string;
  severity: string;
  description?: string;
  root_cause_analysis?: any;
  department_affected: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  department?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  finding?: Finding | null;
  findingIds?: string[];  // For bulk assignment
}

const QuickCAPAAssignment: React.FC<Props> = ({ open, onClose, onSuccess, finding, findingIds }) => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState<User | null>(null);
  const [priority, setPriority] = useState('HIGH');
  const [targetDate, setTargetDate] = useState<Date | null>(addDays(new Date(), 30));
  
  useEffect(() => {
    if (open) {
      fetchUsers();
      
      if (finding) {
        // Auto-populate from finding
        setTitle(`CAPA: ${finding.title}`);
        setDescription(finding.description || '');
        setRootCause(typeof finding.root_cause_analysis === 'string' 
          ? finding.root_cause_analysis 
          : JSON.stringify(finding.root_cause_analysis || {}, null, 2)
        );
        
        // Auto-set priority from severity
        const priorityMap: Record<string, string> = {
          'CRITICAL': 'CRITICAL',
          'HIGH': 'HIGH',
          'MEDIUM': 'MEDIUM',
          'LOW': 'LOW',
        };
        setPriority(priorityMap[finding.severity] || 'MEDIUM');
        
        // Auto-calculate target date from finding type
        const daysMap: Record<string, number> = {
          'MAJOR_NC': 14,    // 14 days for Major NC
          'MINOR_NC': 30,    // 30 days for Minor NC
          'OBSERVATION': 60, // 60 days for Observation
          'OPPORTUNITY': 90, // 90 days for OFI
        };
        const days = daysMap[finding.finding_type] || 30;
        setTargetDate(addDays(new Date(), days));
      }
    } else {
      // Reset form
      resetForm();
    }
  }, [open, finding]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRootCause('');
    setActionPlan('');
    setResponsiblePerson(null);
    setPriority('HIGH');
    setTargetDate(addDays(new Date(), 30));
  };
  
  const handleSubmit = async () => {
    if (!title || !responsiblePerson || !actionPlan || !targetDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (findingIds && findingIds.length > 0) {
        // Bulk assignment
        const payload = {
          finding_ids: findingIds,
          responsible_person_id: responsiblePerson.id,
          target_date: targetDate.toISOString().split('T')[0],
          action_plan: actionPlan,
        };
        
        await axiosInstance.post('/audits/capas/bulk-assign/', payload);
      } else if (finding) {
        // Single assignment
        const payload = {
          finding_id: finding.id,
          action_type: 'CORRECTIVE',
          title: title,
          description: description,
          root_cause: rootCause,
          action_plan: actionPlan,
          responsible_person_id: responsiblePerson.id,
          priority: priority,
          target_completion_date: targetDate.toISOString().split('T')[0],
          effectiveness_criteria: `Verify that ${finding.title.toLowerCase()} has been resolved and controls are in place to prevent recurrence.`,
        };
        
        await axiosInstance.post('/audits/capas/', payload);
        
        // Send notification
        try {
          const capaResponse = await axiosInstance.get('/audits/capas/');
          const latestCAPA = capaResponse.data[0];
          if (latestCAPA) {
            await axiosInstance.post(`/audits/capas/${latestCAPA.id}/send-notification/`);
          }
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error assigning CAPA:', error);
      alert(error.response?.data?.error || 'Failed to assign CAPA');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getSuggestedResponsible = () => {
    if (!finding) return users;
    
    // Suggest users from the same department
    return users.filter(u => 
      u.department === finding.department_affected ||
      u.position?.includes('MANAGER')
    );
  };
  
  const getDeadlineText = () => {
    if (!targetDate) return '';
    
    const days = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 7) return `⚠️ ${days} days (Urgent)`;
    if (days <= 14) return `⏰ ${days} days (High Priority)`;
    return `📅 ${days} days`;
  };
  
  const isBulk = findingIds && findingIds.length > 0;
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
              }}
            >
              <CAPAIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isBulk ? `Assign CAPA to ${findingIds.length} Findings` : 'Assign CAPA'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {finding ? finding.finding_code : 'Quick corrective action assignment'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <Stack spacing={3}>
            {/* Finding Context */}
            {finding && (
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.02), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon fontSize="small" color="error" />
                  Finding Details
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Code:</strong> {finding.finding_code}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Type:</strong> {finding.finding_type.replace('_', ' ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Severity:</strong> {finding.severity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Department:</strong> {finding.department_affected}
                  </Typography>
                </Stack>
              </Paper>
            )}
            
            {isBulk && (
              <Alert severity="info">
                You are assigning a CAPA to {findingIds.length} findings. The same action plan will be applied to all selected findings.
              </Alert>
            )}
            
            {/* CAPA Details */}
            <TextField
              fullWidth
              label="CAPA Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              helperText="Brief description of the corrective action"
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what needs to be corrected..."
            />
            
            {!isBulk && (
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Root Cause"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="Why did this non-conformity occur?"
                helperText="Use 5-Why analysis or fishbone diagram"
              />
            )}
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Action Plan"
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              required
              placeholder="1. Identify all affected areas&#10;2. Implement corrections&#10;3. Verify effectiveness&#10;4. Update procedures"
              helperText="Step-by-step plan to implement the corrective action"
            />
            
            <Divider />
            
            {/* Assignment */}
            <Stack direction="row" spacing={2}>
              <Autocomplete
                fullWidth
                options={getSuggestedResponsible()}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.position})`}
                value={responsiblePerson}
                onChange={(_, newValue) => setResponsiblePerson(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Responsible Person"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PersonIcon fontSize="small" sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack>
                      <Typography variant="body2">
                        {option.first_name} {option.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.position} {option.department && `• ${option.department}`}
                      </Typography>
                    </Stack>
                  </li>
                )}
              />
              
              <FormControl sx={{ minWidth: 180 }} required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="CRITICAL">
                    <Chip label="CRITICAL" color="error" size="small" />
                  </MenuItem>
                  <MenuItem value="HIGH">
                    <Chip label="HIGH" sx={{ bgcolor: alpha(theme.palette.error.main, 0.7), color: 'white' }} size="small" />
                  </MenuItem>
                  <MenuItem value="MEDIUM">
                    <Chip label="MEDIUM" color="warning" size="small" />
                  </MenuItem>
                  <MenuItem value="LOW">
                    <Chip label="LOW" color="info" size="small" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <DatePicker
                label="Target Completion Date"
                value={targetDate}
                onChange={(date) => setTargetDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: getDeadlineText(),
                    InputProps: {
                      startAdornment: <CalendarIcon fontSize="small" sx={{ ml: 1, mr: 0.5, color: 'action.active' }} />
                    }
                  }
                }}
              />
              
              {finding && (
                <Paper sx={{ p: 2, minWidth: 200, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    Suggested Timeline
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {finding.finding_type === 'MAJOR_NC' && '14 days (Major NC)'}
                    {finding.finding_type === 'MINOR_NC' && '30 days (Minor NC)'}
                    {finding.finding_type === 'OBSERVATION' && '60 days (Optional)'}
                    {finding.finding_type === 'OPPORTUNITY' && '90 days (Optional)'}
                  </Typography>
                </Paper>
              )}
            </Stack>
            
            {/* Smart Recommendations */}
            {finding && finding.finding_type === 'MAJOR_NC' && (
              <Alert severity="error" icon={<ErrorIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Major Non-Conformity - Immediate Action Required
                </Typography>
                <Typography variant="caption">
                  • Containment action within 24 hours<br />
                  • CAPA plan submission within 14 days<br />
                  • Implementation within 60-90 days<br />
                  • Mandatory follow-up audit
                </Typography>
              </Alert>
            )}
            
            {finding && finding.finding_type === 'MINOR_NC' && (
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Minor Non-Conformity - Action Required
                </Typography>
                <Typography variant="caption">
                  • Immediate correction within 7 days<br />
                  • CAPA implementation within 30 days<br />
                  • Effectiveness verification within 60 days
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Email notification will be sent to responsible person
            </Typography>
          </Box>
          
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!title || !responsiblePerson || !actionPlan || !targetDate || submitting}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
            }}
          >
            {submitting ? 'Assigning...' : isBulk ? `Assign to ${findingIds.length} Findings` : 'Assign CAPA'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default QuickCAPAAssignment;

