import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Common components (loaded immediately - small & used everywhere)
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationProvider from './components/common/NotificationSystem';

// Optimize Inter font - only load needed weights with font-display swap
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Core navigation components (loaded immediately)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToHome from './components/BackToHome';

// Context providers (loaded immediately)
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { PPEPermissionProvider } from './context/PPEPermissionContext';

// Lazy load route components for code splitting
const Home = lazy(() => import('./components/Home'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));
const PasswordReset = lazy(() => import('./components/PasswordReset'));
const UnifiedNavigation = lazy(() => import('./components/navigation/UnifiedNavigation'));

// Document Components - lazy loaded
const DocumentManagementDashboard = lazy(() => import('./components/document/DocumentManagementDashboard'));
const DocumentManagementLayout = lazy(() => import('./components/document/DocumentManagementLayout'));
const DocumentList = lazy(() => import('./components/document/DocumentList'));
const DocumentDetail = lazy(() => import('./components/document/DocumentDetail'));
const DocumentLibrary = lazy(() => import('./components/document/DocumentLibrary'));
const DocumentEditor = lazy(() => import('./components/document/DocumentEditor'));
const ChangeRequest = lazy(() => import('./components/document/ChangeRequest'));
const ChangeRequestManagement = lazy(() => import('./components/document/ChangeRequestManagement'));
const QuickReports = lazy(() => import('./components/document/QuickReports'));
const ApprovalWorkflow = lazy(() => import('./components/document/ApprovalWorkflow'));
const SearchDocuments = lazy(() => import('./components/document/SearchDocuments'));
const Records = lazy(() => import('./components/document/Records'));

// Compliance Components - lazy loaded
const ComplianceLayout = lazy(() => import('./components/legal/ComplianceLayout'));
const ComplianceDashboard = lazy(() => import('./components/legal/ComplianceDashboard'));
const ComplianceObligations = lazy(() => import('./components/legal/ComplianceObligations'));
const ComplianceReview = lazy(() => import('./components/legal/ComplianceReview'));
const ComplianceCalendar = lazy(() => import('./components/legal/ComplianceCalendar'));
const EvidenceManagement = lazy(() => import('./components/legal/EvidenceManagement'));
const RegulatoryChangeTracker = lazy(() => import('./components/legal/RegulatoryChangeTracker'));
const ImprovedLawLibrary = lazy(() => import('./components/legal/ImprovedLawLibrary'));
const LawLibrary = lazy(() => import('./components/legal/LawLibrary'));
const LegalRegister = lazy(() => import('./components/legal/LegalRegister'));
const LegislationTracker = lazy(() => import('./components/legal/LegislationTracker'));

// PPE Components - lazy loaded
const PPEManagementLayout = lazy(() => import('./components/ppe/PPEManagementLayout'));
const PPEDashboard = lazy(() => import('./components/ppe/PPEDashboard'));
const PPERegister = lazy(() => import('./components/ppe/PPERegister'));
const StockPosition = lazy(() => import('./components/ppe/StockPosition'));
const InventoryManagement = lazy(() => import('./components/ppe/InventoryManagement'));
const Purchases = lazy(() => import('./components/ppe/Purchases'));
const Vendors = lazy(() => import('./components/ppe/Vendors'));
const Requests = lazy(() => import('./components/ppe/Requests'));
const Issuance = lazy(() => import('./components/ppe/Issuance'));
const Returns = lazy(() => import('./components/ppe/Returns'));
const DamageReports = lazy(() => import('./components/ppe/DamageReports'));
const Settings = lazy(() => import('./components/ppe/Settings'));
const ProtectedPPERoute = lazy(() => import('./components/ppe/ProtectedPPERoute'));

// Audit Components - lazy loaded
const AuditLayout = lazy(() => import('./components/audit').then(m => ({ default: m.AuditLayout })));
const AuditDashboard = lazy(() => import('./components/audit').then(m => ({ default: m.AuditDashboard })));
const AuditPlanner = lazy(() => import('./components/audit').then(m => ({ default: m.AuditPlanner })));
const Findings = lazy(() => import('./components/audit').then(m => ({ default: m.Findings })));
const CAPAManagement = lazy(() => import('./components/audit').then(m => ({ default: m.CAPAManagement })));
const AuditTable = lazy(() => import('./components/audit').then(m => ({ default: m.AuditTable })));
const AuditExecution = lazy(() => import('./components/audit').then(m => ({ default: m.AuditExecution })));
const AuditReports = lazy(() => import('./components/audit').then(m => ({ default: m.AuditReports })));
const ManagementReview = lazy(() => import('./components/audit/ManagementReview'));

// Risk Management Components - lazy loaded
const RiskLayout = lazy(() => import('./components/risks').then(m => ({ default: m.RiskLayout })));
const RiskDashboard = lazy(() => import('./components/risks').then(m => ({ default: m.RiskDashboard })));
const RiskMatrix = lazy(() => import('./components/risks').then(m => ({ default: m.RiskMatrix })));
const RiskRegister = lazy(() => import('./components/risks').then(m => ({ default: m.RiskRegister })));

// Admin Components - lazy loaded
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./components/admin/UserManagement'));
const DepartmentManagement = lazy(() => import('./components/admin/DepartmentManagement'));
const SecuritySettings = lazy(() => import('./components/admin/SecuritySettings'));
const SystemSettings = lazy(() => import('./components/admin/SystemSettings'));
const ProtectedAdminRoute = lazy(() => import('./components/admin/ProtectedAdminRoute'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress size={48} />
    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Loading...</Box>
  </Box>
);

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0052D4',
      light: '#2979ff',
      dark: '#003494',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4364F7',
      light: '#6B8AFF',
      dark: '#2F45AC',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a237e',
      secondary: '#455a64',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    // Headings
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    // Body text
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    // Subtitles
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    // Caption
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    // Button
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    // Overline
    overline: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 82, 212, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 82, 212, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 100%)',
          borderRadius: 0,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          '&:hover': {
            backgroundColor: 'rgba(0, 82, 212, 0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.875rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
        },
      },
    },
  },
});

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// HomeRedirect component - redirects authenticated users to dashboard
const HomeRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />;
};

// Layout component that conditionally renders Navbar
const Layout: React.FC = () => {
  const location = useLocation();
  const isDocumentManagement = location.pathname.startsWith('/document-management');
  const isCompliancePage = location.pathname.startsWith('/compliance');
  const isPPEPage = location.pathname.startsWith('/ppe');
  const isAuditPage = location.pathname.startsWith('/audit');
  const isRiskPage = location.pathname.startsWith('/risks');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isDashboardPage = location.pathname === '/dashboard';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isPasswordResetPage = location.pathname.startsWith('/reset-password');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isDocumentManagement && !isCompliancePage && !isPPEPage && !isAuditPage && !isRiskPage && !isAdminPage && !isDashboardPage && !isLoginPage && !isRegisterPage && !isPasswordResetPage && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/dashboard" element={<PrivateRoute><UnifiedNavigation currentModule="Dashboard"><Dashboard /></UnifiedNavigation></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/reset-password/:user_id/:reset_code" element={<PasswordReset />} />
          
          {/* Document Management Routes */}
          <Route
            path="/document-management"
            element={
              <PrivateRoute>
                <DocumentManagementLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DocumentManagementDashboard />} />
            <Route path="library" element={<DocumentLibrary />} />
            <Route path="library/:id" element={<DocumentDetail />} />
            <Route path="library/:id/edit" element={<DocumentEditor />} />
            <Route path="records" element={<Records />} />
            <Route path="quick-reports" element={<QuickReports />} />
            <Route path="change-request/:id" element={<ChangeRequest />} />
            <Route path="change-request-management" element={<ChangeRequestManagement />} />
            <Route path="approvals" element={<ApprovalWorkflow />} />
          </Route>

          {/* Compliance Routes */}
          <Route path="/compliance" element={<PrivateRoute><ComplianceLayout /></PrivateRoute>}>
            <Route index element={<ComplianceDashboard />} />
            <Route path="register" element={<ComplianceObligations />} />
            <Route path="review" element={<ComplianceReview />} />
            <Route path="calendar" element={<ComplianceCalendar />} />
            <Route path="evidence" element={<EvidenceManagement />} />
            <Route path="library" element={<ImprovedLawLibrary />} />
            <Route path="tracker" element={<RegulatoryChangeTracker />} />
          </Route>
          <Route path="/legal/*" element={<Navigate to="/compliance" replace />} />

          {/* Audit Routes */}
          <Route path="/audit" element={<PrivateRoute><AuditLayout /></PrivateRoute>}>
            <Route index element={<AuditDashboard />} />
            <Route path="dashboard" element={<AuditDashboard />} />
            <Route path="planner" element={<AuditPlanner />} />
            <Route path="execute/:auditId" element={<AuditExecution />} />
            <Route path="findings" element={<Findings />} />
            <Route path="management-review" element={<ManagementReview />} />
            <Route path="capas" element={<CAPAManagement />} />
            <Route path="table" element={<AuditTable />} />
            <Route path="reports" element={<AuditReports />} />
          </Route>

          {/* Risk Management Routes */}
          <Route path="/risks" element={<PrivateRoute><RiskLayout /></PrivateRoute>}>
            <Route index element={<RiskDashboard />} />
            <Route path="dashboard" element={<RiskDashboard />} />
            <Route path="matrix" element={<RiskMatrix />} />
            <Route path="register" element={<RiskRegister />} />
          </Route>

          {/* PPE Routes */}
          <Route path="/ppe" element={<PrivateRoute><PPEManagementLayout /></PrivateRoute>}>
            <Route index element={<PPEDashboard />} />
            <Route path="register" element={<PPERegister />} />
            <Route path="stock-position" element={<StockPosition />} />
            <Route path="inventory" element={
              <ProtectedPPERoute requiredPermission="canManageInventory">
                <InventoryManagement />
              </ProtectedPPERoute>
            } />
            <Route path="purchases" element={
              <ProtectedPPERoute requiredPermission="canManagePurchases">
                <Purchases />
              </ProtectedPPERoute>
            } />
            <Route path="vendors" element={
              <ProtectedPPERoute requiredPermission="canManageVendors">
                <Vendors />
              </ProtectedPPERoute>
            } />
            <Route path="requests" element={<Requests />} />
            <Route path="issuance" element={<Issuance />} />
            <Route path="returns" element={<Returns />} />
            <Route path="damage-reports" element={<DamageReports />} />
            <Route path="settings" element={
              <ProtectedPPERoute requiredPermission="canManageSettings">
                <Settings />
              </ProtectedPPERoute>
            } />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
        </Routes>
        </Suspense>
      </Box>
      {!isDocumentManagement && !isCompliancePage && !isPPEPage && !isAuditPage && !isRiskPage && !isAdminPage && !isDashboardPage && !isLoginPage && <Footer />}
      <BackToHome />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <AdminProvider>
              <PPEPermissionProvider>
                <Router>
                  <Layout />
                </Router>
              </PPEPermissionProvider>
            </AdminProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
