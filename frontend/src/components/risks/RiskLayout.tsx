import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const RiskLayout: React.FC = () => {
  return (
    <UnifiedNavigation currentModule="Risk Management">
      <Outlet />
    </UnifiedNavigation>
  );
};

export default RiskLayout;

