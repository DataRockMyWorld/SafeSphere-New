import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface ScoringCriteria {
  id: number;
  finding_type: string;
  display_name: string;
  color_code: string;
  score_percentage: string;
  definition: string;
  action_required: string;
  examples: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const ScoringCriteriaGuide: React.FC<Props> = ({ open, onClose }) => {
  const theme = useTheme();
  const [criteria, setCriteria] = useState<ScoringCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (open) {
      fetchCriteria();
    }
  }, [open]);
  
  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/audits/scoring-criteria/');
      setCriteria(response.data);
    } catch (error) {
      console.error('Error fetching scoring criteria:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getColor = (colorCode: string) => {
    switch (colorCode) {
      case 'GREEN':
        return theme.palette.success.main;
      case 'YELLOW':
        return theme.palette.warning.light;
      case 'ORANGE':
        return theme.palette.warning.main;
      case 'RED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getIcon = (colorCode: string) => {
    switch (colorCode) {
      case 'GREEN':
        return <CheckCircleIcon />;
      case 'YELLOW':
      case 'ORANGE':
        return <WarningIcon />;
      case 'RED':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TrophyIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Audit Scoring Criteria
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ISO 45001:2018 Industry Standards
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {/* Overall Grading Scale */}
        <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Overall Audit Grading Scale
          </Typography>
          
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrophyIcon sx={{ color: theme.palette.success.main }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ≥80% - Pass with Distinction (Green)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Excellent performance, exceeds requirements
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ color: theme.palette.warning.main }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  50-79% - Pass (Amber)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Meets requirements with some improvement areas
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ErrorIcon sx={{ color: theme.palette.error.main }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  &lt;50% - Fail (Red)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Significant gaps, does not meet requirements
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Finding Type Criteria */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Finding Type Definitions & Scoring
        </Typography>
        
        <Stack spacing={2}>
          {criteria.map((item) => {
            const color = getColor(item.color_code);
            
            return (
              <Accordion
                key={item.id}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(color, 0.3)}`,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: alpha(color, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', mr: 2 }}>
                    <Box sx={{ color }}>{getIcon(item.color_code)}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.display_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Score: {item.score_percentage}%
                      </Typography>
                    </Box>
                    <Chip
                      label={item.color_code}
                      size="small"
                      sx={{
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        fontWeight: 600,
                        border: `1px solid ${alpha(color, 0.3)}`,
                      }}
                    />
                  </Stack>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    {/* Definition */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        DEFINITION
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                        {item.definition}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    {/* Action Required */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                        ACTION REQUIRED
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                        {item.action_required}
                      </Typography>
                    </Box>
                    
                    {item.examples && (
                      <>
                        <Divider />
                        
                        {/* Examples */}
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                            EXAMPLES
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                            {item.examples}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScoringCriteriaGuide;

