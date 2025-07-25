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
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3 }}>
        <IconButton
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            width: 64,
            height: 64,
            mb: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          {icon}
        </IconButton>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
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
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    },
    {
      title: 'Legal Register & Law Library',
      description: 'Track legal compliance requirements and access comprehensive legal documents, regulations, and compliance resources',
      icon: <LegalIcon />,
      path: '/legal',
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    },
    {
      title: 'PPE Management',
      description: 'Track and manage Personal Protective Equipment inventory with automated alerts',
      icon: <PPEIcon />,
      path: '/ppe',
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
    },
    {
      title: 'Audit Management',
      description: 'Schedule and track HSSE compliance audits with comprehensive reporting tools',
      icon: <AuditIcon />,
      path: '/audits',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
    },
    {
      title: 'Performance Management',
      description: 'Monitor and improve HSSE performance metrics with real-time dashboards',
      icon: <PerformanceIcon />,
      path: '/performance',
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    },
  ];

  const quickActions = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: theme.palette.primary.main,
    },
    {
      title: 'Notifications',
      icon: <NotificationIcon />,
      path: '/notifications',
      color: theme.palette.warning.main,
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      color: theme.palette.grey[600],
    },
  ];

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const adminUrl = `${backendUrl.replace(/\/$/, '')}/admin/`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {isAuthenticated ? (
          <Box sx={{ py: 6 }}>
            {/* Quick Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 6, flexWrap: 'wrap' }}>
              {quickActions.map((action) => (
                <Tooltip key={action.title} title={action.title}>
                  <IconButton
                    onClick={() => navigate(action.path)}
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: alpha(action.color, 0.1),
                      color: action.color,
                      '&:hover': {
                        backgroundColor: alpha(action.color, 0.2),
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
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
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes fadeInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
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
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    minWidth: 320,
                    maxWidth: 400,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: 6,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                  }}
                >
                  <AdminPanelSettingsIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.dark }}>
                    Django Admin Panel
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, textAlign: 'center' }}>
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
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      boxShadow: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
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
                  fontWeight: 800,
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
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
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 8px 25px rgba(0, 82, 212, 0.3)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: '0 12px 35px rgba(0, 82, 212, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
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
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
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
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1 + 0.2}s both`,
                    '@keyframes fadeInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
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