import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const SystemSettings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure system-wide settings and preferences
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Coming Soon</Typography>
          <Typography variant="body1">
            System settings features are currently under development. This will include:
          </Typography>
          <ul style={{ textAlign: 'left', marginTop: 8 }}>
            <li>System configuration management</li>
            <li>Email notification settings</li>
            <li>Backup and restore configuration</li>
            <li>System maintenance scheduling</li>
            <li>Performance monitoring settings</li>
            <li>Integration configuration</li>
            <li>System health monitoring</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default SystemSettings; 