import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';

const DepartmentManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Department Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage organizational departments and structure
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Coming Soon</Typography>
          <Typography variant="body1">
            Department management features are currently under development. This will include:
          </Typography>
          <ul style={{ textAlign: 'left', marginTop: 8 }}>
            <li>Create and manage departments</li>
            <li>Assign users to departments</li>
            <li>Department hierarchy management</li>
            <li>Department-specific permissions</li>
            <li>Department analytics and reporting</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default DepartmentManagement; 