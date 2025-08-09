import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Common components
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationProvider from './components/common/NotificationSystem';

// Import Inter font
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToHome from './components/BackToHome';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PasswordReset from './components/PasswordReset';

// Document Components
import DocumentManagementDashboard from './components/document/DocumentManagementDashboard';
import DocumentManagementLayout from './components/document/DocumentManagementLayout';
import DocumentList from './components/document/DocumentList';
import DocumentDetail from './components/document/DocumentDetail';
import DocumentLibrary from './components/document/DocumentLibrary';
import DocumentEditor from './components/document/DocumentEditor';
import ChangeRequest from './components/document/ChangeRequest';
import ChangeRequestManagement from './components/document/ChangeRequestManagement';
import DocumentHistory from './components/document/DocumentHistory';
import ApprovalWorkflow from './components/document/ApprovalWorkflow';
import SearchDocuments from './components/document/SearchDocuments';
import Records from './components/document/Records';

// Legal Components
import LegalLayout from './components/legal/LegalLayout';
import LawLibrary from './components/legal/LawLibrary';
import LegalRegister from './components/legal/LegalRegister';
import LegislationTracker from './components/legal/LegislationTracker';

// PPE Components
import PPEManagementLayout from './components/ppe/PPEManagementLayout';
import PPEDashboard from './components/ppe/PPEDashboard';
import PPERegister from './components/ppe/PPERegister';
import StockPosition from './components/ppe/StockPosition';
import InventoryManagement from './components/ppe/InventoryManagement';
import Purchases from './components/ppe/Purchases';
import Vendors from './components/ppe/Vendors';
import Requests from './components/ppe/Requests';
import Issuance from './components/ppe/Issuance';
import Returns from './components/ppe/Returns';
import DamageReports from './components/ppe/DamageReports';
import Settings from './components/ppe/Settings';
import ProtectedPPERoute from './components/ppe/ProtectedPPERoute';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { PPEPermissionProvider } from './context/PPEPermissionContext';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import DepartmentManagement from './components/admin/DepartmentManagement';
import SecuritySettings from './components/admin/SecuritySettings';
import SystemSettings from './components/admin/SystemSettings';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';

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

// Layout component that conditionally renders Navbar
const Layout: React.FC = () => {
  const location = useLocation();
  const isDocumentManagement = location.pathname.startsWith('/document-management');
  const isLegalPage = location.pathname.startsWith('/legal');
  const isPPEPage = location.pathname.startsWith('/ppe');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isDocumentManagement && !isLegalPage && !isPPEPage && !isAdminPage && !isLoginPage && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
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
            <Route path="change-request/:id" element={<ChangeRequest />} />
            <Route path="change-request-management" element={<ChangeRequestManagement />} />
            <Route path="history" element={<DocumentHistory />} />
            <Route path="approvals" element={<ApprovalWorkflow />} />
          </Route>

          {/* Legal Routes */}
          <Route path="/legal" element={<PrivateRoute><LegalLayout /></PrivateRoute>}>
            <Route path="library" element={<LawLibrary />} />
            <Route path="register" element={<LegalRegister />} />
            <Route path="tracker" element={<LegislationTracker />} />
            <Route index element={<LawLibrary />} />
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
      </Box>
      {!isDocumentManagement && !isLegalPage && !isPPEPage && !isAdminPage && !isLoginPage && <Footer />}
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
