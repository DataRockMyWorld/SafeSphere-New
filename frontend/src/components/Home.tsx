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
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        background: 'white',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
          '& .icon-wrapper': {
            background: gradient,
            transform: 'scale(1.1) rotate(5deg)',
            '& svg': {
              color: '#ffffff',
              transform: 'scale(1.05)',
            },
          },
          '& .arrow-icon': {
            transform: 'translateX(6px)',
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          className="icon-wrapper"
          sx={{
            width: 60,
            height: 60,
            borderRadius: '18px',
            backgroundColor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            transition: 'all 0.4s ease',
            alignSelf: 'flex-start',
            '& svg': {
              fontSize: 28,
              color: color,
              transition: 'all 0.4s ease',
            },
          }}
        >
          {icon}
        </Box>
        
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1.5,
            lineHeight: 1.3,
            fontSize: '1.1rem',
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.5,
            mb: 2.5,
            flex: 1,
            fontSize: '0.875rem',
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label="Access Module"
            size="small"
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
            }}
          />
          <IconButton
            className="arrow-icon"
            size="small"
            sx={{
              color: color,
              opacity: 0.7,
              transition: 'all 0.3s ease',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: alpha(color, 0.1),
              },
            }}
          >
            <ArrowIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
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
          </Box>
        ) : (
          <Box sx={{ py: 8 }}>
            {/* Hero Section for non-authenticated users */}
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  lineHeight: 1.2,
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