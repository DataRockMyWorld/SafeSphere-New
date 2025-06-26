import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { Shield as ShieldIcon } from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        height: '2vh',
        minHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShieldIcon 
              sx={{ 
                fontSize: 16, 
                color: theme.palette.primary.main, 
                mr: 1 
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              © {currentYear} SafeSphere
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Safety First, Always
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 