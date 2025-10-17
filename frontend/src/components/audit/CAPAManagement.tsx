import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  TrendingUp as ProgressIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface CAPA {
  id: string;
  action_code: string;
  title: string;
  action_type: string;
  priority: string;
  status: string;
  target_completion_date: string;
  progress_percentage: number;
  finding_code: string;
  responsible_person_name: string;
  is_overdue: boolean;
  days_overdue: number;
  days_remaining: number;
  created_at: string;
}

const CAPAManagement: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [capas, setCapas] = useState<CAPA[]>([]);
  const [myCapas, setMyCapas] = useState<CAPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCapa, setSelectedCapa] = useState<any>(null);
  const [progressDialog, setProgressDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Progress update form
  const [progressUpdate, setProgressUpdate] = useState({
    progress_percentage: 0,
    update_text: '',
    challenges_faced: '',
    next_steps: '',
  });
  
  useEffect(() => {
    fetchData();
  }, [currentTab]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      if (currentTab === 0) {
        // My CAPAs
        const response = await axiosInstance.get('/audits/capas/my-capas/');
        setMyCapas(response.data);
      } else {
        // All CAPAs (HSSE Manager only)
        const response = await axiosInstance.get('/audits/capas/');
        setCapas(response.data);
      }
    } catch (error) {
      console.error('Error fetching CAPAs:', error);
      showSnackbar('Failed to load CAPAs', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return theme.palette.error.dark;
      case 'HIGH':
        return theme.palette.error.main;
      case 'MEDIUM':
        return theme.palette.warning.main;
      case 'LOW':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED':
      case 'VERIFIED':
        return theme.palette.success.main;
      case 'IN_PROGRESS':
      case 'COMPLETED':
        return theme.palette.info.main;
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const openProgressDialog = (capa: CAPA) => {
    setSelectedCapa(capa);
    setProgressUpdate({
      progress_percentage: capa.progress_percentage,
      update_text: '',
      challenges_faced: '',
      next_steps: '',
    });
    setProgressDialog(true);
  };
  
  const submitProgressUpdate = async () => {
    if (!selectedCapa) return;
    
    try {
      await axiosInstance.post('/audits/capas/progress-update/', {
        capa: selectedCapa.id,
        ...progressUpdate,
      });
      
      showSnackbar('Progress updated successfully', 'success');
      setProgressDialog(false);
      fetchData();
    } catch (error) {
      showSnackbar('Failed to update progress', 'error');
    }
  };
  
  const renderCAPACard = (capa: CAPA) => (
    <Card
      key={capa.id}
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(getPriorityColor(capa.priority), 0.2)}`,
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {capa.action_code}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {capa.title}
            </Typography>
          </Box>
          <Chip
            label={capa.priority}
            size="small"
            sx={{
              bgcolor: alpha(getPriorityColor(capa.priority), 0.1),
              color: getPriorityColor(capa.priority),
              fontWeight: 600,
            }}
          />
        </Box>
        
        {/* Status & Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Chip
              label={capa.status.replace('_', ' ')}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(capa.status), 0.1),
                color: getStatusColor(capa.status),
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {capa.progress_percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={capa.progress_percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: capa.progress_percentage === 100 
                  ? theme.palette.success.main 
                  : theme.palette.primary.main,
                borderRadius: 4,
              },
            }}
          />
        </Box>
        
        {/* Details */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => window.open(`/audit/findings`, '_blank')}
              >
                Finding: {capa.finding_code}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="caption" color="text.secondary">
                Assigned to: {capa.responsible_person_name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography
                variant="caption"
                sx={{
                  color: capa.is_overdue ? theme.palette.error.main : theme.palette.text.secondary,
                  fontWeight: capa.is_overdue ? 600 : 400,
                }}
              >
                Due: {capa.target_completion_date}
                {capa.is_overdue && ` (${capa.days_overdue}d overdue)`}
                {!capa.is_overdue && capa.days_remaining > 0 && ` (${capa.days_remaining}d remaining)`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Overdue Alert */}
        {capa.is_overdue && (
          <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              ⚠️ {capa.days_overdue} days overdue!
            </Typography>
          </Alert>
        )}
        
        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => openProgressDialog(capa)}
            startIcon={<ProgressIcon />}
          >
            Update Progress
          </Button>
          {capa.progress_percentage === 100 && capa.status !== 'VERIFIED' && (
            <Button
              variant="contained"
              size="small"
              fullWidth
              color="success"
              startIcon={<CompleteIcon />}
            >
              Submit for Verification
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
  
  const currentCapas = currentTab === 0 ? myCapas : capas;
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            CAPA Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Corrective & Preventive Actions tracking and management
          </Typography>
        </Box>
        <IconButton onClick={fetchData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="My CAPAs" />
          {user?.position === 'HSSE MANAGER' && <Tab label="All CAPAs" />}
        </Tabs>
      </Paper>
      
      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {currentCapas.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total CAPAs
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
              {currentCapas.filter(c => c.is_overdue).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Overdue
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
              {currentCapas.filter(c => c.status === 'IN_PROGRESS').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              In Progress
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
              {currentCapas.filter(c => c.status === 'CLOSED').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Closed
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* CAPA Cards */}
      {currentCapas.length > 0 ? (
        <Grid container spacing={3}>
          {currentCapas.map((capa) => (
            <Grid item xs={12} md={6} lg={4} key={capa.id}>
              {renderCAPACard(capa)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
          }}
        >
          <AssignmentIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {currentTab === 0 ? 'No CAPAs Assigned to You' : 'No CAPAs Found'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentTab === 0 
              ? 'You have no corrective or preventive actions assigned at the moment'
              : 'No CAPAs have been created yet'}
          </Typography>
        </Paper>
      )}
      
      {/* Progress Update Dialog */}
      <Dialog
        open={progressDialog}
        onClose={() => setProgressDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedCapa && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Update Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCapa.action_code}: {selectedCapa.title}
              </Typography>
            </DialogTitle>
            
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Progress Slider */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Progress Percentage
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {progressUpdate.progress_percentage}%
                    </Typography>
                  </Box>
                  <TextField
                    type="number"
                    fullWidth
                    value={progressUpdate.progress_percentage}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(0, Number(e.target.value)));
                      setProgressUpdate({ ...progressUpdate, progress_percentage: value });
                    }}
                    inputProps={{ min: 0, max: 100, step: 5 }}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={progressUpdate.progress_percentage}
                    sx={{
                      mt: 2,
                      height: 10,
                      borderRadius: 5,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  />
                </Box>
                
                {/* Update Text */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Progress Update *"
                  value={progressUpdate.update_text}
                  onChange={(e) => setProgressUpdate({ ...progressUpdate, update_text: e.target.value })}
                  placeholder="Describe what has been accomplished..."
                  required
                />
                
                {/* Challenges */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Challenges Faced"
                  value={progressUpdate.challenges_faced}
                  onChange={(e) => setProgressUpdate({ ...progressUpdate, challenges_faced: e.target.value })}
                  placeholder="Any challenges or obstacles..."
                />
                
                {/* Next Steps */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Next Steps"
                  value={progressUpdate.next_steps}
                  onChange={(e) => setProgressUpdate({ ...progressUpdate, next_steps: e.target.value })}
                  placeholder="What will be done next..."
                />
              </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setProgressDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={submitProgressUpdate}
                disabled={!progressUpdate.update_text}
              >
                Submit Update
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
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

export default CAPAManagement;

