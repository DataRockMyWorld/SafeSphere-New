import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

// Context
interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Reducer
const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove non-persistent notifications
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, newNotification.duration);
    }

    // Limit number of notifications
    if (state.notifications.length >= maxNotifications) {
      const oldestNotification = state.notifications[0];
      if (oldestNotification) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: oldestNotification.id });
      }
    }
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification({
      type: 'success',
      title,
      message: message || 'Operation completed successfully',
    });
  };

  const showError = (title: string, message?: string) => {
    showNotification({
      type: 'error',
      title,
      message: message || 'An error occurred',
      persistent: true, // Errors are persistent by default
    });
  };

  const showWarning = (title: string, message?: string) => {
    showNotification({
      type: 'warning',
      title,
      message: message || 'Please review the information',
    });
  };

  const showInfo = (title: string, message?: string) => {
    showNotification({
      type: 'info',
      title,
      message: message || 'Information',
    });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationDisplay notifications={state.notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Display component
interface NotificationDisplayProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  notifications,
  onRemove,
}) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {notifications.map((notification) => (
        <Collapse key={notification.id} in={true}>
          <Alert
            severity={notification.type}
            icon={getIcon(notification.type)}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => onRemove(notification.id)}
              >
                <CloseIcon />
              </IconButton>
            }
            sx={{
              mb: 1,
              boxShadow: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>
              {notification.title}
            </AlertTitle>
            {notification.message}
            {notification.action && (
              <Box sx={{ mt: 1 }}>
                <IconButton
                  size="small"
                  onClick={notification.action.onClick}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'underline',
                    fontSize: '0.875rem',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {notification.action.label}
                </IconButton>
              </Box>
            )}
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
};

// Toast notification component (simpler version)
interface ToastProps {
  open: boolean;
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  type,
  onClose,
  duration = 4000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationProvider;
