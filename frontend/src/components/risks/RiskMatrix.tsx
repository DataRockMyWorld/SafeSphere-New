import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  Stack,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface MatrixConfig {
  matrix_size: number;
  probability_definitions: { [key: string]: any };
  severity_definitions: { [key: string]: any };
  low_threshold: number;
  medium_threshold: number;
  low_risk_color: string;
  medium_risk_color: string;
  high_risk_color: string;
}

interface RiskAssessment {
  id: string;
  event_number: string;
  location: string;
  process_area: string;
  residual_probability: number;
  residual_severity: number;
  residual_risk_level: number;
  residual_risk_color: string;
}

const RiskMatrix: React.FC = () => {
  const theme = useTheme();
  const [config, setConfig] = useState<MatrixConfig | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ prob: number; sev: number } | null>(null);
  const [cellDialog, setCellDialog] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, assessmentsRes] = await Promise.all([
        axiosInstance.get('/risks/matrix-config/'),
        axiosInstance.get('/risks/assessments/'),
      ]);
      setConfig(configRes.data);
      setAssessments(assessmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getRiskColor = (riskLevel: number) => {
    if (!config) return theme.palette.grey[300];
    
    if (riskLevel <= config.low_threshold) {
      return config.low_risk_color;
    } else if (riskLevel <= config.medium_threshold) {
      return config.medium_risk_color;
    } else {
      return config.high_risk_color;
    }
  };
  
  const getRiskRating = (riskLevel: number) => {
    if (!config) return '';
    
    if (riskLevel <= config.low_threshold) {
      return 'LOW';
    } else if (riskLevel <= config.medium_threshold) {
      return 'MEDIUM';
    } else {
      return 'HIGH';
    }
  };
  
  const getAssessmentsInCell = (prob: number, sev: number) => {
    return assessments.filter(
      a => a.residual_probability === prob && a.residual_severity === sev
    );
  };
  
  const handleCellClick = (prob: number, sev: number) => {
    setSelectedCell({ prob, sev });
    setCellDialog(true);
  };
  
  const cellAssessments = selectedCell 
    ? getAssessmentsInCell(selectedCell.prob, selectedCell.sev)
    : [];
  
  if (loading || !config) {
    return <LinearProgress />;
  }
  
  const matrixSize = config.matrix_size;
  const probabilities = Array.from({ length: matrixSize }, (_, i) => matrixSize - i);
  const severities = Array.from({ length: matrixSize }, (_, i) => i + 1);
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          5×5 Risk Matrix
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Interactive risk visualization - Click any cell to view assessments
        </Typography>
      </Box>
      
      {/* Legend */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Risk Levels:
          </Typography>
          <Chip
            label={`Low (1-${config.low_threshold})`}
            sx={{
              bgcolor: config.low_risk_color,
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Chip
            label={`Medium (${config.low_threshold + 1}-${config.medium_threshold})`}
            sx={{
              bgcolor: config.medium_risk_color,
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Chip
            label={`High (${config.medium_threshold + 1}+)`}
            sx={{
              bgcolor: config.high_risk_color,
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Stack>
      </Paper>
      
      {/* Matrix */}
      <Paper sx={{ p: 3, borderRadius: 2, overflowX: 'auto' }}>
        <Grid container spacing={0} sx={{ minWidth: 600 }}>
          {/* Top left corner - Labels */}
          <Grid item xs={2}>
            <Box
              sx={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.grey[500], 0.05),
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                P \ S
              </Typography>
            </Box>
          </Grid>
          
          {/* Severity Headers */}
          {severities.map(sev => (
            <Grid size={2} key={`sev-header-${sev}`}>
              <Tooltip title={config.severity_definitions[sev]?.description || ''}>
                <Box
                  sx={{
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    cursor: 'help',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {sev}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {config.severity_definitions[sev]?.label}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
          
          {/* Matrix Cells */}
          {probabilities.map(prob => (
            <React.Fragment key={`row-${prob}`}>
              {/* Probability Header */}
              <Grid item xs={2}>
                <Tooltip title={config.probability_definitions[prob]?.description || ''}>
                  <Box
                    sx={{
                      height: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      cursor: 'help',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {prob}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {config.probability_definitions[prob]?.label}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              
              {/* Risk Cells */}
              {severities.map(sev => {
                const riskLevel = prob * sev;
                const cellRisks = getAssessmentsInCell(prob, sev);
                const riskColor = getRiskColor(riskLevel);
                const riskRating = getRiskRating(riskLevel);
                
                return (
                  <Grid size={2} key={`cell-${prob}-${sev}`}>
                    <Tooltip title={`Click to view ${cellRisks.length} assessment(s)`}>
                      <Box
                        onClick={() => cellRisks.length > 0 && handleCellClick(prob, sev)}
                        sx={{
                          height: 80,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid ${theme.palette.divider}`,
                          bgcolor: alpha(riskColor, 0.15),
                          cursor: cellRisks.length > 0 ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                          '&:hover': cellRisks.length > 0 ? {
                            bgcolor: alpha(riskColor, 0.3),
                            transform: 'scale(1.05)',
                            boxShadow: 2,
                          } : {},
                        }}
                      >
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700, 
                            color: riskColor,
                          }}
                        >
                          {riskLevel}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: riskColor }}>
                          {riskRating}
                        </Typography>
                        {cellRisks.length > 0 && (
                          <Chip
                            label={cellRisks.length}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: riskColor,
                              color: 'white',
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  </Grid>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
        
        {/* Axis Labels */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            ← PROBABILITY (Likelihood)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            SEVERITY (Consequence) →
          </Typography>
        </Box>
      </Paper>
      
      {/* Cell Detail Dialog */}
      <Dialog
        open={cellDialog}
        onClose={() => setCellDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCell && (
          <>
            <DialogTitle sx={{ pb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      Risk Level: {selectedCell.prob * selectedCell.sev}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Probability {selectedCell.prob} × Severity {selectedCell.sev}
                    </Typography>
                  </Box>
                <IconButton onClick={() => setCellDialog(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                {cellAssessments.length} Assessment(s) in this cell:
              </Typography>
              <List>
                {cellAssessments.map(assessment => (
                  <ListItem 
                    key={assessment.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: `1px solid ${alpha(assessment.residual_risk_color, 0.3)}`,
                      bgcolor: alpha(assessment.residual_risk_color, 0.05),
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {assessment.event_number}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {assessment.location} - {assessment.process_area}
                          </Typography>
                          <Chip
                            label={`Risk: ${assessment.residual_risk_level}`}
                            size="small"
                            sx={{
                              mt: 0.5,
                              bgcolor: assessment.residual_risk_color,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RiskMatrix;

