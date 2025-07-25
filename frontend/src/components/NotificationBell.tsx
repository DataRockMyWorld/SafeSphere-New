import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DocumentIcon,
  Assignment as FormIcon,
  SystemUpdate as SystemIcon,
  Home as WelcomeIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  related_object_id?: string;
  related_object_type?: string;
}

const NotificationBell: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/notifications/');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await axiosInstance.get(`/notifications/${notificationId}/`);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post('/notifications/mark-all-read/');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axiosInstance.post('/notifications/delete-all/');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return <WelcomeIcon color="primary" />;
      case 'CHANGE_REQUEST':
        return <DocumentIcon color="warning" />;
      case 'DOCUMENT_APPROVED':
        return <CheckCircleIcon color="success" />;
      case 'DOCUMENT_REJECTED':
        return <CancelIcon color="error" />;
      case 'RECORD_SUBMITTED':
      case 'RECORD_APPROVED':
      case 'RECORD_REJECTED':
        return <FormIcon color="info" />;
      default:
        return <SystemIcon color="action" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return theme.palette.primary.main;
      case 'CHANGE_REQUEST':
        return theme.palette.warning.main;
      case 'DOCUMENT_APPROVED':
      case 'RECORD_APPROVED':
        return theme.palette.success.main;
      case 'DOCUMENT_REJECTED':
      case 'RECORD_REJECTED':
        return theme.palette.error.main;
      case 'RECORD_SUBMITTED':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
      <IconButton
        onClick={handleClick}
          sx={{
            color: theme.palette.text.secondary,
            background: alpha(theme.palette.primary.main, 0.08),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.15),
              transform: 'scale(1.05)',
              color: theme.palette.primary.main,
            },
            transition: 'all 0.2s ease',
          }}
      >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                background: theme.palette.error.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              },
            }}
          >
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                sx={{
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5,
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="small"
                  onClick={deleteAllNotifications}
                sx={{
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5,
                  background: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': {
                    background: alpha(theme.palette.error.main, 0.2),
                  },
                }}
                >
                  Clear all
                </Button>
              )}
            </Box>
          </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.04),
                      },
                      ...(notification.is_read ? {} : {
                        background: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.12),
                      },
                      }),
                    }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.notification_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: notification.is_read ? 400 : 600,
                            color: notification.is_read ? 'text.primary' : 'text.primary',
                            fontSize: '0.875rem',
                            }}
                          >
                            {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{
                              color: 'text.disabled',
                              fontSize: '0.7rem',
                            }}
                          >
                            {formatDate(notification.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.is_read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: theme.palette.primary.main,
                          ml: 1,
                          }}
                      />
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ mx: 2, opacity: 0.5 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell; 