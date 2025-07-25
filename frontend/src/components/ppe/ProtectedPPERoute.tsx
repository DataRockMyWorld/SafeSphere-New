import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { usePPEPermissions } from '../../context/PPEPermissionContext';

interface ProtectedPPERouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof import('../../context/PPEPermissionContext').PPEPermissions;
  fallbackPath?: string;
}

const ProtectedPPERoute: React.FC<ProtectedPPERouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/ppe',
}) => {
  const { user, isAuthenticated } = useAuth();
  const { permissions, isHSSEManager, isLoading } = usePPEPermissions();
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
            Access Restricted
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You don't have permission to access this PPE management feature. This area is restricted to HSSE Managers and administrators.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your current role: {user.position}
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

export default ProtectedPPERoute; 