import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

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

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      letterSpacing: '0.025em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
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
  const isLoginPage = location.pathname === '/login';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isDocumentManagement && !isLegalPage && !isLoginPage && <Navbar />}
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
            <Route path="settings" element={<div>Document Settings</div>} />
          </Route>

          {/* Legal Routes */}
          <Route path="/legal" element={<PrivateRoute><LegalLayout /></PrivateRoute>}>
            <Route path="library" element={<LawLibrary />} />
            <Route path="register" element={<LegalRegister />} />
            <Route path="tracker" element={<LegislationTracker />} />
            <Route index element={<LawLibrary />} />
          </Route>
        </Routes>
      </Box>
      {!isDocumentManagement && !isLegalPage && !isLoginPage && <Footer />}
      <BackToHome />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
