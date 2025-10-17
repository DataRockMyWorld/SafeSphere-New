import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const AuditLayout: React.FC = () => {
  return (
    <UnifiedNavigation currentModule="Audit Management">
      <Outlet />
    </UnifiedNavigation>
  );
};

export default AuditLayout;

