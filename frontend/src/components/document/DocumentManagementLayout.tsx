import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const DocumentManagementLayout: React.FC = () => {
  return (
    <UnifiedNavigation currentModule="Document Hub">
      <Outlet />
    </UnifiedNavigation>
  );
};

export default DocumentManagementLayout; 