import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const Settings: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
      Settings
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Configure PPE management settings
    </Typography>
    
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          PPE Management Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This component will include system configuration, notification settings, and user preferences.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export default Settings; 