import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CircularProgress,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import logoImage from '../assets/logo.png';

const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await axiosInstance.post('/auth/password-reset/', { email });
      setSuccess(true);
    } catch (err: any) {
      // Always show success message to prevent email enumeration
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Check Your Email
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              If an account with that email exists, we've sent a password reset code to{' '}
              <strong>{email}</strong>. The code will expire in 15 minutes.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Didn't receive the email?</strong>
                <br />
                • Check your spam/junk folder
                <br />
                • Make sure you entered the correct email address
                <br />
                • Wait a few minutes and try again
              </Typography>
            </Alert>

            <Button
              component={Link}
              to="/login"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back to Login
            </Button>
            
            <Button
              variant="text"
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
            >
              Try Another Email
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={logoImage}
              alt="SafeSphere Logo"
              sx={{
                width: 60,
                height: 'auto',
                mb: 2,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you a password reset code
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
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
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@company.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !email}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 4px 14px rgba(0, 82, 212, 0.25)',
                mb: 2,
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                startIcon={<ArrowBack />}
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
