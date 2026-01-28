import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Divider,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
  SecurityOutlined,
  VerifiedUserOutlined,
  HealthAndSafetyOutlined,
  ShieldOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      const emailError = validateEmail(formData.email);
      setErrors(prev => ({ ...prev, email: emailError }));
    } else if (field === 'password') {
      const passwordError = validatePassword(formData.password);
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    // Real-time validation for touched fields
    if (touched[name as keyof typeof touched]) {
      if (name === 'email') {
        const emailError = validateEmail(value);
        setErrors(prev => ({ ...prev, email: emailError }));
      } else if (name === 'password') {
        const passwordError = validatePassword(value);
        setErrors(prev => ({ ...prev, password: passwordError }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }
    
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />
      
      {/* Floating Shield Icon */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '8%',
          opacity: 0.08,
          animation: 'floatShield 6s ease-in-out infinite',
          '@keyframes floatShield': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(5deg)' },
          },
        }}
      >
        <ShieldOutlined sx={{ fontSize: 120, color: theme.palette.primary.main }} />
      </Box>
      
      {/* Floating Health Icon */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          opacity: 0.08,
          animation: 'floatHealth 7s ease-in-out infinite',
          '@keyframes floatHealth': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-25px) rotate(-5deg)' },
          },
        }}
      >
        <HealthAndSafetyOutlined sx={{ fontSize: 100, color: theme.palette.secondary.main }} />
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              background: 'white',
              maxWidth: 950,
              mx: 'auto',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Left Side - Brand & Features Section */}
            <Box
              sx={{
                flex: { md: '0 0 42%' },
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Grid Pattern Background */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    linear-gradient(${alpha('#ffffff', 0.05)} 1px, transparent 1px),
                    linear-gradient(90deg, ${alpha('#ffffff', 0.05)} 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                  opacity: 0.5,
                }}
              />
              
              {/* Content Container */}
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                {/* Logo and Brand */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    component="img"
                    src={logoImage}
                    alt="SafeSphere Logo"
                    sx={{
                      width: 60,
                      height: 'auto',
                      mb: 2,
                      filter: 'brightness(0) invert(1) drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      mb: 1,
                      fontSize: '1.75rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    SafeSphere
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#ffffff', 0.95),
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Comprehensive HSSE Management
                  </Typography>
                </Box>

                {/* Feature Highlights */}
                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background: alpha('#ffffff', 0.15),
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <SecurityOutlined sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 0.25, fontSize: '0.9rem' }}>
                        Enterprise Security
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.85), lineHeight: 1.4, fontSize: '0.75rem' }}>
                        Bank-level encryption
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background: alpha('#ffffff', 0.15),
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <VerifiedUserOutlined sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 0.25, fontSize: '0.9rem' }}>
                        Compliance Ready
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.85), lineHeight: 1.4, fontSize: '0.75rem' }}>
                        ISO, OSHA standards
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background: alpha('#ffffff', 0.15),
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <HealthAndSafetyOutlined sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 0.25, fontSize: '0.9rem' }}>
                        Safety First
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.85), lineHeight: 1.4, fontSize: '0.75rem' }}>
                        Proactive risk management
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Trust Badges */}
              <Box sx={{ position: 'relative', zIndex: 2, mt: 3 }}>
                <Divider sx={{ borderColor: alpha('#ffffff', 0.2), mb: 2 }} />
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), display: 'block', mb: 1.5, fontSize: '0.7rem' }}>
                  Trusted by industry leaders
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Chip
                    label="ISO Certified"
                    size="small"
                    sx={{
                      background: alpha('#ffffff', 0.15),
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                  <Chip
                    label="SOC 2"
                    size="small"
                    sx={{
                      background: alpha('#ffffff', 0.15),
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                  <Chip
                    label="GDPR"
                    size="small"
                    sx={{
                      background: alpha('#ffffff', 0.15),
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                </Stack>
              </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: { xs: 3, md: 4 },
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
                  mb: 3,
                }}
              >
                <Box
                  component="img"
                  src={logoImage}
                  alt="SafeSphere Logo"
                  sx={{
                    width: 60,
                    height: 'auto',
                    mb: 1.5,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    textAlign: 'center',
                  }}
                >
                  SafeSphere
                </Typography>
              </Box>

              <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="h1"
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      color: theme.palette.text.primary,
                      letterSpacing: '-0.02em',
                      fontSize: '1.5rem',
                    }}
                  >
                    Welcome Back
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Sign in to access your HSSE dashboard
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      py: 0.5,
                      '& .MuiAlert-message': {
                        fontSize: '0.85rem',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="your.email@company.com"
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email 
                            sx={{ 
                              color: touched.email && errors.email 
                                ? theme.palette.error.main 
                                : touched.email && !errors.email && formData.email
                                ? theme.palette.success.main
                                : theme.palette.text.secondary, 
                              fontSize: 18,
                              transition: 'color 0.2s ease',
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: touched.email && errors.email ? 0.5 : 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: touched.email && errors.email 
                              ? theme.palette.error.main 
                              : theme.palette.primary.main,
                          },
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                            borderColor: touched.email && errors.email 
                              ? theme.palette.error.main 
                              : theme.palette.primary.main,
                          },
                        },
                        '&.Mui-error': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.error.main,
                          },
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.9rem',
                        padding: '14px 14px 14px 0',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem',
                        '&.Mui-focused': {
                          color: touched.email && errors.email 
                            ? theme.palette.error.main 
                            : theme.palette.primary.main,
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.75rem',
                        marginTop: '4px',
                        marginLeft: 0,
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
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock 
                            sx={{ 
                              color: touched.password && errors.password 
                                ? theme.palette.error.main 
                                : touched.password && !errors.password && formData.password
                                ? theme.palette.success.main
                                : theme.palette.text.secondary, 
                              fontSize: 18,
                              transition: 'color 0.2s ease',
                            }} 
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            size="small"
                            sx={{ 
                              color: touched.password && errors.password 
                                ? theme.palette.error.main 
                                : theme.palette.text.secondary,
                              transition: 'color 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: touched.password && errors.password ? 0.5 : 0.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: touched.password && errors.password 
                              ? theme.palette.error.main 
                              : theme.palette.primary.main,
                          },
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                            borderColor: touched.password && errors.password 
                              ? theme.palette.error.main 
                              : theme.palette.primary.main,
                          },
                        },
                        '&.Mui-error': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.error.main,
                          },
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.9rem',
                        padding: '14px 14px 14px 0',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem',
                        '&.Mui-focused': {
                          color: touched.password && errors.password 
                            ? theme.palette.error.main 
                            : theme.palette.primary.main,
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: '0.75rem',
                        marginTop: '4px',
                        marginLeft: 0,
                      },
                    }}
                  />

                  {/* Remember Me & Forgot Password */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, mt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          size="small"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&.Mui-checked': {
                              color: theme.palette.primary.main,
                            },
                            padding: '6px',
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                          Remember me
                        </Typography>
                      }
                    />
                    <Typography
                      component={Link}
                      to="/forgot-password"
                      variant="body2"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading || !formData.email || !formData.password || !!errors.email || !!errors.password}
                    endIcon={isLoading ? null : <ArrowForward />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: '0 4px 14px rgba(0, 82, 212, 0.25)',
                      transition: 'all 0.2s ease',
                      '&:hover:not(.Mui-disabled)': {
                        boxShadow: '0 6px 20px rgba(0, 82, 212, 0.35)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        background: theme.palette.grey[300],
                        color: theme.palette.grey[500],
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  {/* Divider */}
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      or
                    </Typography>
                  </Divider>

                  {/* Sign Up Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      Don't have an account?{' '}
                      <Typography
                        component={Link}
                        to="/register"
                        variant="body2"
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Create account
                      </Typography>
                    </Typography>
                  </Box>

                  {/* Security Notice */}
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 1.5,
                      borderRadius: 2,
                      background: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <SecurityOutlined sx={{ fontSize: 16, color: theme.palette.info.main }} />
                      <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 600, fontSize: '0.8rem' }}>
                        Secure Access
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, lineHeight: 1.4, display: 'block', fontSize: '0.75rem' }}>
                      Your connection is encrypted with 256-bit SSL.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Footer Text */}
        <Box sx={{ mt: 2.5, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8rem',
              mb: 0.75,
            }}
          >
            © {new Date().getFullYear()} SafeSphere. All rights reserved.
          </Typography>
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            <Typography
              component="a"
              href="#"
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                fontSize: '0.75rem',
                '&:hover': {
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                },
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                fontSize: '0.75rem',
                '&:hover': {
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                },
              }}
            >
              Terms of Service
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                fontSize: '0.75rem',
                '&:hover': {
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                },
              }}
            >
              Support
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 