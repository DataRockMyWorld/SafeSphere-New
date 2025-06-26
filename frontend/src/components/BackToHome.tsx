import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Fab,
  Tooltip,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';

const BackToHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: isMobile ? 20 : 30,
        right: isMobile ? 20 : 30,
        zIndex: 1000,
      }}
    >
      <Tooltip
        title="Back to Home"
        placement="left"
        arrow
        sx={{
          '& .MuiTooltip-tooltip': {
            backgroundColor: theme.palette.grey[900],
            color: 'white',
            fontSize: '0.875rem',
            padding: '8px 12px',
            boxShadow: theme.shadows[8],
            '& .MuiTooltip-arrow': {
              color: theme.palette.grey[900],
            },
          },
        }}
      >
        <Fab
          onClick={() => navigate('/')}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            width: isMobile ? 56 : 64,
            height: isMobile ? 56 : 64,
            boxShadow: '0 8px 32px rgba(0, 82, 212, 0.3)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.05)',
              boxShadow: '0 12px 40px rgba(0, 82, 212, 0.4)',
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            },
            '&:active': {
              transform: 'translateY(-2px) scale(1.02)',
            },
            '& .MuiFab-label': {
              fontSize: isMobile ? '1.5rem' : '1.75rem',
            },
          }}
          aria-label="Back to Home"
        >
          <HomeIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default BackToHome; 