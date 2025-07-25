import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

const SecuritySettings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Security Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure system security and access controls
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Coming Soon</Typography>
          <Typography variant="body1">
            Security settings features are currently under development. This will include:
          </Typography>
          <ul style={{ textAlign: 'left', marginTop: 8 }}>
            <li>Password policy configuration</li>
            <li>Account lockout settings</li>
            <li>Session timeout management</li>
            <li>Two-factor authentication setup</li>
            <li>Audit log configuration</li>
            <li>IP whitelist management</li>
            <li>Security event monitoring</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default SecuritySettings; 