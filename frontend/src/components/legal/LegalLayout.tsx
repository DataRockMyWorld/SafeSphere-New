import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const LegalLayout: React.FC = () => {
  return (
    <UnifiedNavigation currentModule="Legal Management">
      <Outlet />
    </UnifiedNavigation>
  );
};

export default LegalLayout;