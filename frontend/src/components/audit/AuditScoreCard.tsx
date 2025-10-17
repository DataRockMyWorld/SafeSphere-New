import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

interface CategoryScore {
  name: string;
  score: number;
  weight: number;
  weighted_contribution: number;
}

interface ScoreData {
  overall_score: number;
  grade: string;
  color: string;
  category_scores: Record<string, CategoryScore>;
  total_questions_answered: number;
}

interface Props {
  scoreData: ScoreData | null;
  totalQuestions?: number;
}

const AuditScoreCard: React.FC<Props> = ({ scoreData, totalQuestions = 0 }) => {
  const theme = useTheme();
  
  if (!scoreData) {
    return null;
  }
  
  const getGradeColor = (color: string) => {
    switch (color) {
      case 'GREEN':
        return theme.palette.success.main;
      case 'AMBER':
        return theme.palette.warning.main;
      case 'RED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'DISTINCTION':
        return <TrophyIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />;
      case 'PASS':
        return <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />;
      case 'FAIL':
        return <ErrorIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />;
      default:
        return <WarningIcon sx={{ fontSize: 40, color: theme.palette.grey[500] }} />;
    }
  };
  
  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case 'DISTINCTION':
        return 'Pass with Distinction';
      case 'PASS':
        return 'Pass';
      case 'FAIL':
        return 'Fail';
      default:
        return 'Unknown';
    }
  };
  
  const gradeColor = getGradeColor(scoreData.color);
  
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `2px solid ${gradeColor}`,
        boxShadow: `0 4px 20px ${alpha(gradeColor, 0.2)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Overall Score */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {getGradeIcon(scoreData.grade)}
          
          <Typography variant="h3" sx={{ fontWeight: 700, color: gradeColor, mt: 1 }}>
            {scoreData.overall_score.toFixed(1)}%
          </Typography>
          
          <Chip
            label={getGradeLabel(scoreData.grade)}
            sx={{
              mt: 1,
              bgcolor: alpha(gradeColor, 0.1),
              color: gradeColor,
              fontWeight: 600,
              fontSize: '0.9rem',
              border: `1px solid ${alpha(gradeColor, 0.3)}`,
            }}
          />
          
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            {scoreData.total_questions_answered} of {totalQuestions} questions answered
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Grading Legend */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Grading Scale
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                }}
              />
              <Typography variant="caption">
                ≥80% - Pass with Distinction
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: theme.palette.warning.main,
                }}
              />
              <Typography variant="caption">
                50-79% - Pass
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: theme.palette.error.main,
                }}
              />
              <Typography variant="caption">
                &lt;50% - Fail
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Category Scores */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Category Breakdown
          </Typography>
          
          <Stack spacing={2}>
            {Object.values(scoreData.category_scores).map((category, index) => {
              const categoryColor = category.score >= 80
                ? theme.palette.success.main
                : category.score >= 50
                ? theme.palette.warning.main
                : theme.palette.error.main;
              
              return (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Tooltip title={`Weight: ${category.weight}%`}>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {category.name}
                      </Typography>
                    </Tooltip>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: categoryColor,
                      }}
                    >
                      {category.score.toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(category.score, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(categoryColor, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: categoryColor,
                        borderRadius: 3,
                      },
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.25, display: 'block' }}>
                    Contributes {category.weighted_contribution.toFixed(1)}% to overall score
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuditScoreCard;

