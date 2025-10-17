import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Grid,
  Chip,
  IconButton,
  Button,
  ButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'permit' | 'obligation' | 'renewal';
  status: 'expired' | 'critical' | 'warning' | 'good';
  department?: string;
  daysUntil: number;
  details?: any;
}

const ComplianceCalendar: React.FC = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Fetch permits/licenses from legislation tracker
      const trackersResponse = await axiosInstance.get('/legals/legislation-trackers/');
      const trackers = trackersResponse.data.results || trackersResponse.data;
      
      // Convert trackers to calendar events
      const trackerEvents: CalendarEvent[] = trackers.map((tracker: any) => {
        const expiryDate = new Date(tracker.expiring_date);
        const today = new Date();
        const daysUntil = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'expired' | 'critical' | 'warning' | 'good';
        if (daysUntil <= 0) status = 'expired';
        else if (daysUntil <= 30) status = 'critical';
        else if (daysUntil <= 90) status = 'warning';
        else status = 'good';
        
        return {
          id: tracker.id,
          title: tracker.permit,
          date: expiryDate,
          type: 'permit',
          status,
          department: tracker.unit,
          daysUntil,
          details: tracker,
        };
      });

      setEvents(trackerEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return theme.palette.error.main;
      case 'critical': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'good': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'expired': return 'EXPIRED';
      case 'critical': return 'CRITICAL';
      case 'warning': return 'WARNING';
      case 'good': return 'GOOD';
      default: return 'UNKNOWN';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get upcoming events (sorted by date)
  const upcomingEvents = [...events]
    .filter(e => e.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10);

  const criticalCount = events.filter(e => e.status === 'critical').length;
  const warningCount = events.filter(e => e.status === 'warning').length;
  const expiredCount = events.filter(e => e.status === 'expired').length;

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Compliance Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track upcoming deadlines, permit renewals, and compliance obligations
        </Typography>
      </Box>

      {/* Alert Summary */}
      {(criticalCount > 0 || expiredCount > 0) && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {expiredCount > 0 && (
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${theme.palette.error.main}` }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon sx={{ color: theme.palette.error.main }} />
                    <Box>
                      <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                        {expiredCount}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        EXPIRED - Immediate Action Required
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {criticalCount > 0 && (
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon sx={{ color: theme.palette.error.main }} />
                    <Box>
                      <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                        {criticalCount}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        Critical (≤30 days)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {warningCount > 0 && (
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon sx={{ color: theme.palette.warning.main }} />
                    <Box>
                      <Typography variant="h5" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                        {warningCount}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        Warning (30-90 days)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* View Toggle */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="calendar">
              <ViewModuleIcon sx={{ mr: 1, fontSize: 18 }} />
              Calendar View
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1, fontSize: 18 }} />
              List View
            </ToggleButton>
          </ToggleButtonGroup>

          {viewMode === 'calendar' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button size="small" onClick={today}>
                Today
              </Button>
              <ButtonGroup size="small">
                <IconButton onClick={previousMonth} size="small">
                  <ChevronLeftIcon />
                </IconButton>
                <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight={600}>
                    {monthName}
                  </Typography>
                </Box>
                <IconButton onClick={nextMonth} size="small">
                  <ChevronRightIcon />
                </IconButton>
              </ButtonGroup>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent sx={{ p: 3 }}>
            {/* Calendar Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {/* Week Days Header */}
              {weekDays.map(day => (
                <Box
                  key={day}
                  sx={{
                    textAlign: 'center',
                    py: 1,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  {day}
                </Box>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <Box key={`empty-${index}`} sx={{ aspectRatio: '1', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 1 }} />
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayEvents = getEventsForDate(day);
                const isToday = day === new Date().getDate() &&
                               currentDate.getMonth() === new Date().getMonth() &&
                               currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <Box
                    key={day}
                    sx={{
                      aspectRatio: '1',
                      borderRadius: 1,
                      p: 0.5,
                      position: 'relative',
                      backgroundColor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'white',
                      border: isToday ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      '&:hover': dayEvents.length > 0 ? {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        transform: 'scale(1.02)',
                      } : {},
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? theme.palette.primary.main : theme.palette.text.primary,
                      }}
                    >
                      {day}
                    </Typography>
                    
                    {dayEvents.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <Box
                            key={idx}
                            onClick={() => setSelectedEvent(event)}
                            sx={{
                              backgroundColor: alpha(getStatusColor(event.status), 0.15),
                              borderLeft: `3px solid ${getStatusColor(event.status)}`,
                              px: 0.5,
                              py: 0.25,
                              mb: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {event.title}
                          </Box>
                        ))}
                        {dayEvents.length > 2 && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                            +{dayEvents.length - 2} more
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Upcoming Deadlines
            </Typography>
            <List sx={{ p: 0 }}>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: alpha(getStatusColor(event.status), 0.1),
                          border: `2px solid ${getStatusColor(event.status)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {event.type === 'permit' ? (
                          <GavelIcon sx={{ color: getStatusColor(event.status) }} />
                        ) : (
                          <AssignmentIcon sx={{ color: getStatusColor(event.status) }} />
                        )}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {event.title}
                          </Typography>
                          <Chip
                            label={getStatusLabel(event.status)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getStatusColor(event.status), 0.1),
                              color: getStatusColor(event.status),
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          {event.department && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <BusinessIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                              <Typography variant="caption" color="text.secondary">
                                {event.department}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                            <Typography variant="caption" color="text.secondary">
                              {event.date.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Chip
                      label={event.daysUntil <= 0 ? 'EXPIRED' : `${event.daysUntil} days`}
                      sx={{
                        backgroundColor: alpha(getStatusColor(event.status), 0.15),
                        color: getStatusColor(event.status),
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </ListItem>
                  {index < upcomingEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              
              {upcomingEvents.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No upcoming deadlines"
                    secondary="All compliance items are in good standing"
                    sx={{ textAlign: 'center', py: 4 }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle
              sx={{
                background: `linear-gradient(135deg, ${getStatusColor(selectedEvent.status)}, ${alpha(getStatusColor(selectedEvent.status), 0.8)})`,
                color: 'white',
                fontWeight: 700,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedEvent.type === 'permit' ? <GavelIcon /> : <AssignmentIcon />}
                {selectedEvent.type === 'permit' ? 'Permit/License Details' : 'Obligation Details'}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedEvent.title}
                </Typography>
                <Chip
                  label={getStatusLabel(selectedEvent.status)}
                  sx={{
                    backgroundColor: alpha(getStatusColor(selectedEvent.status), 0.1),
                    color: getStatusColor(selectedEvent.status),
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                    Due Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedEvent.date.toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                    Days Until Due
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: getStatusColor(selectedEvent.status) }}>
                    {selectedEvent.daysUntil <= 0 ? 'EXPIRED' : `${selectedEvent.daysUntil} days`}
                  </Typography>
                </Grid>

                {selectedEvent.department && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                      Department/Unit
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedEvent.department}
                    </Typography>
                  </Grid>
                )}

                {selectedEvent.type === 'permit' && selectedEvent.details && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                        License Number
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedEvent.details.license_number}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                        Issuing Authority
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedEvent.details.issuing_authority}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                        Action Taken
                      </Typography>
                      <Typography variant="body2">
                        {selectedEvent.details.action_taken || 'No action recorded'}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ComplianceCalendar;

