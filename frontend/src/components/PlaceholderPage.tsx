import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        p: 4,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
      }}
    >
      <ConstructionIcon sx={{ fontSize: 56, color: theme.palette.primary.main, mb: 2, opacity: 0.8 }} />
      <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
        {description ?? 'This module is planned. Content will be available in a future release.'}
      </Typography>
    </Box>
  );
};

export default PlaceholderPage;
