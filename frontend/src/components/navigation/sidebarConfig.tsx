import React from 'react';
import {
  Dashboard as DashboardIcon,
  ReportProblem as NearMissIcon,
  Checklist as InspectionsIcon,
  Assignment as CAPAIcon,
  TrendingUp as ObjectivesIcon,
  ShowChart as TrendsIcon,
  RateReview as ManagementReviewIcon,
  Description as DocumentsIcon,
  Gavel as ComplianceIcon,
  WarningAmber as RiskIcon,
  FactCheck as AuditsIcon,
  Engineering as PPEIcon,
  AdminPanelSettings as AdminIcon,
  LibraryBooks as LibraryIcon,
  Archive as RecordsIcon,
  TableChart as MatrixIcon,
  Schedule as ReviewScheduleIcon,
  LowPriority as ChangeRequestIcon,
  History as ApprovalIcon,
  Scale as LegalScaleIcon,
  Policy as PolicyIcon,
  Inventory as InventoryIcon,
  ShoppingCart as PurchasesIcon,
  LocalShipping as VendorsIcon,
  Assignment as RequestsIcon,
  AssignmentInd as IssuanceIcon,
  AssignmentReturn as ReturnsIcon,
  ReportProblem as DamageReportsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  BusinessCenter as DepartmentIcon,
  VpnKey as SecurityIcon,
  Tune as SystemSettingsIcon,
  Schedule as ScheduleIcon,
  FindInPage as FindingsIcon,
  TableChart as AuditTableIcon,
  Assessment as ReportIcon,
  AccountTree as RiskMatrixIcon,
  Assignment as RiskRegisterIcon,
} from '@mui/icons-material';

export const SIDEBAR_STORAGE_KEY = 'safesphere-sidebar-groups';

/** Default expanded groups per design doc: Operations and Performance */
export const DEFAULT_EXPANDED_GROUPS = ['operations', 'performance'];

export interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiresRole?: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  defaultExpanded: boolean;
  items: NavItem[];
}

/** Fixed (always visible) sidebar items – one click from anywhere */
export const FIXED_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

/** Collapsible groups per HSSE UX Design Recommendation */
export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    id: 'operations',
    label: 'Operations',
    defaultExpanded: true,
    items: [
      { title: 'Incidents & Near Misses', path: '/incidents', icon: <NearMissIcon /> },
      { title: 'Inspections', path: '/inspections', icon: <InspectionsIcon /> },
      { title: 'Actions / CAPAs', path: '/audit/capas', icon: <CAPAIcon /> },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    defaultExpanded: true,
    items: [
      { title: 'Objectives & KPIs', path: '/objectives', icon: <ObjectivesIcon /> },
      { title: 'Trends', path: '/trends', icon: <TrendsIcon /> },
      { title: 'Management Review', path: '/audit/management-review', icon: <ManagementReviewIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    defaultExpanded: false,
    items: [
      { title: 'Documents', path: '/document-management', icon: <DocumentsIcon /> },
      { title: 'Compliance', path: '/compliance', icon: <ComplianceIcon /> },
      { title: 'Risk', path: '/risks', icon: <RiskIcon /> },
      { title: 'Audits', path: '/audit', icon: <AuditsIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    defaultExpanded: false,
    items: [
      { title: 'PPE', path: '/ppe', icon: <PPEIcon /> },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    defaultExpanded: false,
    items: [
      { title: 'Users', path: '/admin/users', icon: <PersonIcon /> },
      { title: 'Departments', path: '/admin/departments', icon: <DepartmentIcon /> },
      { title: 'Security', path: '/admin/security', icon: <SecurityIcon /> },
      { title: 'Settings', path: '/admin/settings', icon: <SystemSettingsIcon /> },
    ],
  },
];

/** Sub-items for governance/resources/administration (single level under group or first child) */
export const GROUP_SUBITEMS: Record<string, NavItem[]> = {
  'governance-documents': [
    { title: 'Library', path: '/document-management/library', icon: <LibraryIcon /> },
    { title: 'Records', path: '/document-management/records', icon: <RecordsIcon /> },
    { title: 'Document Matrix', path: '/document-management/matrix', icon: <MatrixIcon /> },
    { title: 'Review Schedule', path: '/document-management/review-schedule', icon: <ReviewScheduleIcon /> },
    { title: 'Change Requests', path: '/document-management/change-request-management', icon: <ChangeRequestIcon /> },
    { title: 'Approvals', path: '/document-management/approvals', icon: <ApprovalIcon /> },
  ],
  'governance-compliance': [
    { title: 'Obligations', path: '/compliance/register', icon: <LegalScaleIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Annual Review', path: '/compliance/review', icon: <PolicyIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Calendar', path: '/compliance/calendar', icon: <ScheduleIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Evidence', path: '/compliance/evidence', icon: <DocumentsIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Law Library', path: '/compliance/library', icon: <LibraryIcon /> },
    { title: 'Change Tracker', path: '/compliance/tracker', icon: <PolicyIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
  ],
  'governance-risk': [
    { title: 'Risk Matrix', path: '/risks/matrix', icon: <RiskMatrixIcon /> },
    { title: 'Risk Register', path: '/risks/register', icon: <RiskRegisterIcon /> },
  ],
  'governance-audits': [
    { title: 'Audit Planner', path: '/audit/planner', icon: <ScheduleIcon /> },
    { title: 'Findings', path: '/audit/findings', icon: <FindingsIcon /> },
    { title: 'Management Review', path: '/audit/management-review', icon: <ManagementReviewIcon /> },
    { title: 'CAPAs', path: '/audit/capas', icon: <CAPAIcon /> },
    { title: 'Audit Table', path: '/audit/table', icon: <AuditTableIcon /> },
    { title: 'Reports', path: '/audit/reports', icon: <ReportIcon /> },
  ],
  'resources-ppe': [
    { title: 'PPE Register', path: '/ppe/register', icon: <InventoryIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Stock Position', path: '/ppe/stock-position', icon: <InventoryIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Inventory', path: '/ppe/inventory', icon: <InventoryIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Purchases', path: '/ppe/purchases', icon: <PurchasesIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Vendors', path: '/ppe/vendors', icon: <VendorsIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Requests', path: '/ppe/requests', icon: <RequestsIcon /> },
    { title: 'Issuance', path: '/ppe/issuance', icon: <IssuanceIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Returns', path: '/ppe/returns', icon: <ReturnsIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
    { title: 'Damage Reports', path: '/ppe/damage-reports', icon: <DamageReportsIcon /> },
    { title: 'Settings', path: '/ppe/settings', icon: <SettingsIcon />, requiresRole: ['HSSE MANAGER', 'ADMIN'] },
  ],
};

export function canSeeItem(item: NavItem, userRole: string, isAdmin: boolean): boolean {
  if (!item.requiresRole) return true;
  const role = userRole.toUpperCase();
  return item.requiresRole.some((r) => r.toUpperCase() === role) || (isAdmin && item.requiresRole.includes('ADMIN'));
}

export function getSubitemsKey(groupId: string, itemPath: string): string | null {
  if (groupId === 'governance') {
    if (itemPath === '/document-management') return 'governance-documents';
    if (itemPath === '/compliance') return 'governance-compliance';
    if (itemPath === '/risks') return 'governance-risk';
    if (itemPath === '/audit') return 'governance-audits';
  }
  if (groupId === 'resources' && itemPath === '/ppe') return 'resources-ppe';
  return null;
}
