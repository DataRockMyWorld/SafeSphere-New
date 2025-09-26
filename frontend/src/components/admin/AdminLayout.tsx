import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const AdminLayout: React.FC = () => {
  return (
    <UnifiedNavigation currentModule="Admin Panel">
      <Outlet />
    </UnifiedNavigation>
  );
};

export default AdminLayout;