import { useEffect, useState } from 'react';
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

interface DocumentDashboardData {
  metrics: {
    total_documents: number;
    pending_approvals: number;
    change_requests: number;
    draft_documents: number;
    approved_documents: number;
  };
  status_breakdown: {
    draft: number;
    hsse_review: number;
    ops_review: number;
    md_approval: number;
    approved: number;
    rejected: number;
  };
  recent_activities: {
    id: number;
    document_title: string;
    action: string;
    performed_by: string;
    created_at: string;
    comment: string;
  }[];
}

const DocumentManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DocumentDashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<DocumentDashboardData>('/documents/dashboard/');
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Unable to load document dashboard');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const actions = [
    {
      label: 'Pending approvals',
      value: data?.metrics.pending_approvals ?? 0,
      description: 'Documents waiting for HSSE sign-off',
      route: '/document-management/library?status=pending',
    },
    {
      label: 'Change requests',
      value: data?.metrics.change_requests ?? 0,
      description: 'Items needing rework or clarification',
      route: '/document-management/change-requests',
    },
    {
      label: 'Drafts without owners',
      value: data?.metrics.draft_documents ?? 0,
      description: 'Finish drafting before they stall',
      route: '/document-management/library?status=draft',
    },
  ];

  const statusBreakdown = data
    ? [
        { label: 'Draft', value: data.status_breakdown.draft },
        { label: 'HSSE review', value: data.status_breakdown.hsse_review },
        { label: 'Operations review', value: data.status_breakdown.ops_review },
        { label: 'MD approval', value: data.status_breakdown.md_approval },
        { label: 'Approved', value: data.status_breakdown.approved },
        { label: 'Rejected', value: data.status_breakdown.rejected },
      ]
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Document work queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Focus on what keeps procedures compliant—no extra chrome.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" action={<Button onClick={() => window.location.reload()}>Retry</Button>}>
            {error}
          </Alert>
        ) : data ? (
          <>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Items needing attention</Typography>
                <Button onClick={() => navigate('/document-management/library')} size="small">
                  Open library
                </Button>
              </Box>
              <List disablePadding>
                {actions.map((item) => (
                  <ListItemText
                    key={item.label}
                    primary={`${item.value} · ${item.label}`}
                    secondary={item.description}
                    sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    onClick={() => navigate(item.route)}
                    primaryTypographyProps={{ fontWeight: 600, sx: { cursor: 'pointer' } }}
                  />
                ))}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Workflow position
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {statusBreakdown.map((status) => (
                  <ListItemText
                    key={status.label}
                    primary={`${status.value} documents`}
                    secondary={status.label}
                    sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                  />
                ))}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Latest updates</Typography>
                <Button size="small" onClick={() => navigate('/document-management/history')}>
                  View audit trail
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.recent_activities.length ? (
                <List disablePadding>
                  {data.recent_activities.slice(0, 8).map((activity) => (
                    <ListItemText
                      key={activity.id}
                      primary={`${activity.document_title} — ${activity.action}`}
                      secondary={`${activity.performed_by} · ${new Date(activity.created_at).toLocaleString()}`}
                      sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No workflow events recorded today.
                </Typography>
              )}
            </Paper>
          </>
        ) : (
          <Alert severity="info">No document activity recorded yet.</Alert>
        )}
      </Stack>
    </Container>
  );
};

export default DocumentManagementDashboard;

