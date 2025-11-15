import { Outlet } from 'react-router-dom';
import UnifiedNavigation from '../navigation/UnifiedNavigation';

const ComplianceLayout = () => (
  <UnifiedNavigation currentModule="Compliance">
    <Outlet />
  </UnifiedNavigation>
);

export default ComplianceLayout;