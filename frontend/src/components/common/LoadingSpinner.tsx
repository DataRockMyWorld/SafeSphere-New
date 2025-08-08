import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Fade,
} from '@mui/material';
import { LoadingState } from '../../types';

interface LoadingSpinnerProps {
  loading: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'skeleton' | 'dots';
  fullScreen?: boolean;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loading,
  message = 'Loading...',
  size = 'medium',
  variant = 'spinner',
  fullScreen = false,
  overlay = false,
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizeMap[size];

  if (!loading) return null;

  const SpinnerContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {variant === 'spinner' && (
        <CircularProgress
          size={spinnerSize}
          thickness={4}
          sx={{
            color: 'primary.main',
          }}
        />
      )}
      
      {variant === 'dots' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                animation: 'pulse 1.4s ease-in-out infinite both',
                animationDelay: `${index * 0.16}s`,
                '@keyframes pulse': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0.8)',
                    opacity: 0.5,
                  },
                  '40%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      )}

      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Fade in={loading}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              minWidth: 200,
              maxWidth: 300,
            }}
          >
            <SpinnerContent />
          </Paper>
        </Box>
      </Fade>
    );
  }

  if (overlay) {
    return (
      <Fade in={loading}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              minWidth: 150,
              maxWidth: 250,
            }}
          >
            <SpinnerContent />
          </Paper>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={loading}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <SpinnerContent />
      </Box>
    </Fade>
  );
};

// Skeleton loading component
export const SkeletonLoader: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  rows?: number;
}> = ({
  loading,
  children,
  variant = 'rectangular',
  width = '100%',
  height = 20,
  rows = 1,
}) => {
  if (!loading) return <>{children}</>;

  return (
    <Box sx={{ width, height }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            width: variant === 'circular' ? height : '100%',
            height: variant === 'circular' ? height : height,
            borderRadius: variant === 'circular' ? '50%' : 1,
            backgroundColor: 'grey.200',
            animation: 'pulse 1.5s ease-in-out infinite',
            mb: index < rows - 1 ? 1 : 0,
            '@keyframes pulse': {
              '0%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.4,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Loading state component
export const LoadingState: React.FC<{
  state: LoadingState;
  loadingMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
  onRetry?: () => void;
}> = ({
  state,
  loadingMessage = 'Loading...',
  errorMessage = 'An error occurred',
  children,
  onRetry,
}) => {
  switch (state) {
    case 'loading':
      return <LoadingSpinner loading={true} message={loadingMessage} />;
    case 'error':
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography color="error" gutterBottom>
            {errorMessage}
          </Typography>
          {onRetry && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={onRetry}
            >
              Click to retry
            </Typography>
          )}
        </Box>
      );
    case 'success':
      return <>{children}</>;
    default:
      return null;
  }
};

export default LoadingSpinner;
