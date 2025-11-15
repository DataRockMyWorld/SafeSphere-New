import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  alpha,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import {
  Description as DocumentIcon,
  Security as SecurityIcon,
  Work as PPEIcon,
  Assessment as AuditIcon,
  TrendingUp as PerformanceIcon,
  Shield as ShieldIcon,
  Gavel as LegalIcon,
  LibraryBooks as LibraryIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactElement<SvgIconProps>;
  onClick: () => void;
  color: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick, color, gradient }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderColor: theme.palette.primary.main,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: theme.palette.grey[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            border: `2px solid ${theme.palette.grey[200]}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '& svg': {
                color: theme.palette.primary.contrastText,
              },
            },
          }}
        >
          {React.cloneElement(icon, {
            sx: {
              fontSize: 28,
              color: theme.palette.text.secondary,
              transition: 'color 0.3s ease',
            },
          })}
        </Box>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 600, 
          fontFamily: '"Inter", sans-serif',
          color: theme.palette.text.primary,
          mb: 2,
        }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ 
          fontFamily: '"Inter", sans-serif',
          color: theme.palette.text.secondary,
          lineHeight: 1.6,
        }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  // Debug log for user object
  React.useEffect(() => {
    console.log('DEBUG: user object in Home:', user);
  }, [user]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      title: 'Document Management',
      description: 'Create, manage, and track all your HSSE documents with advanced workflow and approval systems',
      icon: <DocumentIcon />,
      path: '/document-management',
      color: theme.palette.primary.main,
      gradient: theme.palette.primary.main,
    },
    {
      title: 'Compliance',
      description: 'Track regulatory obligations, reviews, and law library content in one place',
      icon: <LegalIcon />,
      path: '/compliance',
      color: theme.palette.text.primary,
      gradient: theme.palette.text.primary,
    },
    {
      title: 'PPE Management',
      description: 'Track and manage Personal Protective Equipment inventory with automated alerts',
      icon: <PPEIcon />,
      path: '/ppe',
      color: theme.palette.text.primary,
      gradient: theme.palette.text.primary,
    },
    {
      title: 'Audit Management',
      description: 'Schedule and track HSSE compliance audits with comprehensive reporting tools',
      icon: <AuditIcon />,
      path: '/audits',
      color: theme.palette.text.primary,
      gradient: theme.palette.text.primary,
    },
    {
      title: 'Performance Management',
      description: 'Monitor and improve HSSE performance metrics with real-time dashboards',
      icon: <PerformanceIcon />,
      path: '/performance',
      color: theme.palette.text.primary,
      gradient: theme.palette.text.primary,
    },
  ];

  const quickActions = [
    {
      title: 'My Dashboard',
      description: 'View your personal overview and recent activity',
      icon: <DashboardIcon />,
      path: '/my-dashboard',
      color: theme.palette.primary.main,
    },
    {
      title: 'Notifications',
      description: 'View system alerts and important updates',
      icon: <NotificationIcon />,
      path: '/notifications',
      color: theme.palette.text.primary,
    },
    {
      title: 'My Profile',
      description: 'Manage your account and preferences',
      icon: <SettingsIcon />,
      path: '/profile',
      color: theme.palette.text.primary,
    },
  ];

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  // Django admin is at the root domain, not under /api/v1
  const adminUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') + '/admin/'
    : 'http://localhost:8000/admin/';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
      }}
    >

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {isAuthenticated ? (
          <Box sx={{ py: 6 }}>
            {/* Quick Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 8, flexWrap: 'wrap' }}>
              {quickActions.map((action) => (
                <Card
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  sx={{
                    minWidth: 200,
                    maxWidth: 250,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      borderColor: action.color,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: action.color === theme.palette.primary.main 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : theme.palette.grey[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mx: 'auto',
                        border: `2px solid ${action.color === theme.palette.primary.main 
                          ? alpha(theme.palette.primary.main, 0.2)
                          : theme.palette.grey[200]}`,
                      }}
                    >
                      {React.cloneElement(action.icon, {
                        sx: {
                          fontSize: 24,
                          color: action.color,
                        },
                      })}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.4 }}>
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Main Features Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                textAlign: 'center', 
                mb: 2,
                color: theme.palette.text.primary,
              }}>
                HSSE Management Modules
              </Typography>
              <Typography variant="body1" sx={{ 
                textAlign: 'center', 
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                mx: 'auto',
              }}>
                Access all your Health, Safety, Security, and Environment management tools
              </Typography>
            </Box>

            {/* Main Features Grid */}
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 4,
              }}
            >
              {features.map((feature, index) => (
                <Box
                  key={feature.title}
                  sx={{
                    height: '100%',
                  }}
                >
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    onClick={() => navigate(feature.path)}
                    color={feature.color}
                    gradient={feature.gradient}
                  />
                </Box>
              ))}
            </Box>
            {/* Django Admin Panel Link for Superusers */}
            {user?.is_superuser && (
              <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    minWidth: 320,
                    maxWidth: 400,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.grey[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      border: `2px solid ${theme.palette.grey[200]}`,
                    }}
                  >
                    <AdminPanelSettingsIcon sx={{ fontSize: 32, color: theme.palette.text.secondary }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    Django Admin Panel
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3, textAlign: 'center', lineHeight: 1.6 }}>
                    Manage all backend data, categories, users, and more with the full power of Django Admin.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Go to Admin Panel
                  </Button>
                </Card>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ py: 8 }}>
            {/* Hero Section for non-authenticated users */}
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '3rem', md: '4rem' },
                  mb: 3,
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '-0.025em',
                }}
              >
                SafeSphere
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  mb: 4,
                  fontWeight: 400,
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '0.01em',
                }}
              >
                Comprehensive Health, Safety, Security, and Environment Management System
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  mb: 6,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    borderWidth: 1,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>

            {/* Features Preview */}
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 4,
              }}
            >
              {features.slice(0, 6).map((feature, index) => (
                <Box
                  key={feature.title}
                  sx={{
                    height: '100%',
                  }}
                >
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    onClick={() => navigate('/login')}
                    color={feature.color}
                    gradient={feature.gradient}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home; 
