import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import axiosInstance from '../../utils/axiosInstance';

type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | string;

interface LegalRegisterEntry {
  id: number;
  title: string;
  owner_department?: string;
  compliance_status: ComplianceStatus;
  next_review_date?: string | null;
  last_review_date?: string | null;
  updated_at?: string;
}

const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LegalRegisterEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get('/legals/register-entries/');
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data.results ?? [];

        if (!cancelled) {
          setEntries(payload);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load compliance data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEntries();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusCounts = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (entry.compliance_status === 'compliant') acc.compliant += 1;
        else if (entry.compliance_status === 'partial') acc.partial += 1;
        else if (entry.compliance_status === 'non-compliant') acc.nonCompliant += 1;
        else acc.unknown += 1;
        return acc;
      },
      { compliant: 0, partial: 0, nonCompliant: 0, unknown: 0 }
    );
  }, [entries]);

  const today = new Date();
  const dueSoon = useMemo(() => {
    return entries.filter((entry) => {
      if (!entry.next_review_date) return false;
      const dueDate = new Date(entry.next_review_date);
      const diffDays =
        (dueDate.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    });
  }, [entries, today]);

  const overdueReviews = useMemo(() => {
    return entries.filter((entry) => {
      if (!entry.next_review_date) return false;
      return new Date(entry.next_review_date) < today;
    });
  }, [entries, today]);

  const missingReviewDates = useMemo(
    () => entries.filter((entry) => !entry.next_review_date),
    [entries]
  );

  const recentUpdates = useMemo(() => {
    return [...entries]
      .sort((a, b) => {
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [entries]);

  const actionItems = [
    {
      label: 'Non-compliant obligations',
      value: statusCounts.nonCompliant,
      description: 'Resolve high-risk gaps immediately.',
      route: '/compliance/register?status=non-compliant',
    },
    {
      label: 'Reviews due in 30 days',
      value: dueSoon.length,
      description: 'Schedule reviews before permits lapse.',
      route: '/compliance/review',
    },
    {
      label: 'Missing next review date',
      value: missingReviewDates.length,
      description: 'Assign review cycles to keep audits defensible.',
      route: '/compliance/register?filter=missing-review',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Compliance board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A single list of regulatory work that protects the organisation today.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Immediate actions
              </Typography>
              <List disablePadding>
                {actionItems.map((item) => (
                  <ListItemText
                    key={item.label}
                    primary={`${item.value} · ${item.label}`}
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: 600, sx: { cursor: 'pointer' } }}
                    sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    onClick={() => navigate(item.route)}
                  />
                ))}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Compliance status</Typography>
                <Button size="small" onClick={() => navigate('/compliance/register')}>
                  Manage obligations
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItemText
                  primary={`${statusCounts.compliant} items`}
                  secondary="Compliant"
                  sx={{ mb: 1 }}
                />
                <ListItemText
                  primary={`${statusCounts.partial} items`}
                  secondary="Partial"
                  sx={{ mb: 1 }}
                />
                <ListItemText
                  primary={`${statusCounts.nonCompliant} items`}
                  secondary="Non-compliant"
                  sx={{ mb: 1 }}
                />
                {statusCounts.unknown > 0 && (
                  <ListItemText
                    primary={`${statusCounts.unknown} items`}
                    secondary="Status not set"
                  />
                )}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Upcoming / overdue reviews</Typography>
                <Button size="small" onClick={() => navigate('/compliance/review')}>
                  Schedule reviews
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {dueSoon.length === 0 && overdueReviews.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No review dates on the radar. Keep tracking.
                </Typography>
              ) : (
                <List disablePadding>
                  {[...dueSoon, ...overdueReviews].slice(0, 8).map((entry) => {
                    const dueDate = entry.next_review_date
                      ? new Date(entry.next_review_date).toLocaleDateString()
                      : 'No date';
                    const overdue =
                      entry.next_review_date && new Date(entry.next_review_date) < today;

                    return (
                      <ListItemText
                        key={entry.id}
                        primary={`${entry.title} · ${dueDate}`}
                        secondary={
                          overdue
                            ? 'Overdue review'
                            : 'Scheduled review within 30 days'
                        }
                        sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                      />
                    );
                  })}
                </List>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Latest register updates</Typography>
                <Button size="small" onClick={() => navigate('/compliance/register')}>
                  Open register
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {recentUpdates.length ? (
                <List disablePadding>
                  {recentUpdates.map((entry) => (
                    <ListItemText
                      key={entry.id}
                      primary={entry.title}
                      secondary={`Status: ${entry.compliance_status} · Updated ${
                        entry.updated_at
                          ? new Date(entry.updated_at).toLocaleString()
                          : 'unknown'
                      }`}
                      sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent changes recorded.
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default ComplianceDashboard;

