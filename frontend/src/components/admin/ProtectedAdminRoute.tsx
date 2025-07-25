import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof import('../../context/AdminContext').AdminPermissions;
  fallbackPath?: string;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/',
}) => {
  const { user, isAuthenticated } = useAuth();
  const { permissions, isAdmin, isLoading } = useAdmin();
  const location = useLocation();

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin access
  if (!isAdmin) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 3,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You don't have permission to access the admin panel. This area is restricted to administrators only.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your current role: {user.role}
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Check specific permission if required
  if (requiredPermission && !permissions[requiredPermission]) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 3,
          p: 3,
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Insufficient Permissions
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You don't have the required permission to access this feature.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required permission: {requiredPermission}
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  // User has access, render the protected content
  return <>{children}</>;
};

export default ProtectedAdminRoute; 