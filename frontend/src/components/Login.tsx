import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        p: 3,
      }}
    >
      {/* Background Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          zIndex: 0,
          animation: 'fadeIn 2s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'scale(0.8)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
          zIndex: 0,
          animation: 'fadeIn 2s ease-out 0.5s both',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'scale(0.8)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.08)',
              background: 'white',
              maxWidth: 1000,
              mx: 'auto',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backdropFilter: 'blur(10px)',
              animation: 'slideUp 1.2s ease-out',
              '@keyframes slideUp': {
                '0%': { opacity: 0, transform: 'translateY(30px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* Left Side - Logo Section */}
            <Grow in timeout={1500}>
              <Box
                sx={{
                  flex: 1,
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 6,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, ${alpha('#ffffff', 0.08)} 0%, transparent 50%)`,
                    zIndex: 1,
                    animation: 'gentlePulse 6s ease-in-out infinite',
                    '@keyframes gentlePulse': {
                      '0%, 100%': { opacity: 0.6 },
                      '50%': { opacity: 0.8 },
                    },
                  }}
                />
                
                {/* Logo Container */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    textAlign: 'center',
                  }}
                >
                  {/* Logo Image with Gentle Animation */}
                  <Box
                    component="img"
                    src={logoImage}
                    alt="SafeSphere Logo"
                    sx={{
                      width: { md: 160, lg: 200 },
                      height: 'auto',
                      mb: 4,
                      filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.15))',
                      animation: 'gentleFloat 4s ease-in-out infinite',
                      '@keyframes gentleFloat': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-6px)' },
                      },
                    }}
                  />
                  
                  {/* Brand Text */}
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      mb: 3,
                      textShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      fontSize: { md: '2.5rem', lg: '3rem' },
                      letterSpacing: '-0.02em',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    SafeSphere
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#ffffff', 0.95),
                      fontWeight: 400,
                      textAlign: 'center',
                      maxWidth: 350,
                      lineHeight: 1.7,
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      fontSize: '1.1rem',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    Comprehensive Health, Safety, Security, and Environment Management System
                  </Typography>

                  {/* Subtle Decorative Elements */}
                  <Box
                    sx={{
                      mt: 4,
                      display: 'flex',
                      gap: 2,
                      opacity: 0.6,
                    }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: alpha('#ffffff', 0.7),
                          animation: `gentleBounce 3s ease-in-out infinite ${i * 0.3}s`,
                          '@keyframes gentleBounce': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-6px)' },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grow>

            {/* Right Side - Login Form */}
            <Grow in timeout={1800}>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: { xs: 4, md: 6, lg: 8 },
                  background: 'white',
                  position: 'relative',
                }}
              >
                {/* Mobile Logo (only visible on mobile) */}
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4,
                  }}
                >
                  <Box
                    component="img"
                    src={logoImage}
                    alt="SafeSphere Logo"
                    sx={{
                      width: 80,
                      height: 'auto',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      textAlign: 'center',
                    }}
                  >
                    SafeSphere
                  </Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                  <Typography
                    component="h1"
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      textAlign: 'center',
                      mb: 1,
                      color: theme.palette.text.primary,
                      letterSpacing: '-0.02em',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    Welcome Back
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: 'center',
                      mb: 4,
                      color: theme.palette.text.secondary,
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    Sign in to your SafeSphere account to continue
                  </Typography>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1rem',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '1rem',
                          '&.Mui-focused': {
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1rem',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '1rem',
                          '&.Mui-focused': {
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      endIcon={isLoading ? null : <ArrowForward />}
                      sx={{
                        py: 1.8,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        fontFamily: '"Inter", sans-serif',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: '0 8px 25px rgba(0, 82, 212, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 35px rgba(0, 82, 212, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&.Mui-disabled': {
                          background: theme.palette.grey[300],
                          color: theme.palette.grey[500],
                        },
                      }}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grow>
          </Paper>
        </Fade>

        {/* Footer Text */}
        <Typography
          variant="body2"
          sx={{
            mt: 4,
            textAlign: 'center',
            color: theme.palette.text.secondary,
            opacity: 0.8,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          © 2025 SafeSphere. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login; 