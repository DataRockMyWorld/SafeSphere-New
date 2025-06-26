import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import LawLibrary from './LawLibrary';
import LegalRegister from './LegalRegister';
import LegislationTracker from './LegislationTracker';

const tabLabels = ['Law Library', 'Legal Register', 'Legislation Tracker'];

const LegalDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Legal Register & Law Library
      </Typography>
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          {tabLabels.map((label, idx) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Paper>
      <Box>
        {tab === 0 && <LawLibrary />}
        {tab === 1 && <LegalRegister />}
        {tab === 2 && <LegislationTracker />}
      </Box>
    </Box>
  );
};

export default LegalDashboard; 