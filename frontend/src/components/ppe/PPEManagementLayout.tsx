import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const PPEManagementLayout: React.FC = () => {
  return (
    <UnifiedNavigation currentModule="PPE Management">
      <Outlet />
    </UnifiedNavigation>
  );
};

export default PPEManagementLayout;