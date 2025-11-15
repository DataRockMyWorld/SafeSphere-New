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
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface DocumentDashboardResponse {
  metrics: {
    total_documents: number;
    pending_approvals: number;
    change_requests: number;
    draft_documents: number;
  };
  recent_activities: {
    id: number;
    document_title: string;
    action: string;
    performed_by: string;
    created_at: string;
  }[];
}

interface StockPositionItem {
  ppe_category: {
    id: number;
    name: string;
  };
  current_stock: number;
  is_low_stock: boolean;
}

interface CapaSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentSummary, setDocumentSummary] = useState<DocumentDashboardResponse | null>(null);
  const [stockPosition, setStockPosition] = useState<StockPositionItem[]>([]);
  const [capas, setCapas] = useState<CapaSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [documentResult, stockResult, capaResult] = await Promise.allSettled([
          axiosInstance.get<DocumentDashboardResponse>('/documents/dashboard/'),
          axiosInstance.get<StockPositionItem[]>('/ppes/dashboard/stock-position/'),
          axiosInstance.get<CapaSummary[]>('/audits/capas/my-capas/'),
        ]);

        if (!cancelled && documentResult.status === 'fulfilled') {
          setDocumentSummary(documentResult.value.data);
        }

        if (!cancelled && stockResult.status === 'fulfilled') {
          setStockPosition(stockResult.value.data);
        }

        if (!cancelled && capaResult.status === 'fulfilled') {
          setCapas(capaResult.value.data);
        }

        if (
          documentResult.status === 'rejected' &&
          stockResult.status === 'rejected' &&
          capaResult.status === 'rejected'
        ) {
          throw new Error('Unable to load dashboard data');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Unable to load dashboard data');
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

  const lowStockItems = useMemo(
    () => stockPosition.filter((item) => item.is_low_stock),
    [stockPosition]
  );

  const openCapas = useMemo(
    () => capas.filter((capa) => !['CLOSED', 'VERIFIED'].includes(capa.status)),
    [capas]
  );

  const immediateActions = [
    {
      label: 'Documents awaiting approval',
      count: documentSummary?.metrics.pending_approvals ?? 0,
      description: 'Send decisions so procedures stay current.',
      action: () => navigate('/document-management'),
    },
    {
      label: 'Open CAPAs assigned to you',
      count: openCapas.length,
      description: 'Close audit findings before they age out.',
      action: () => navigate('/audit/capa-management'),
    },
    {
      label: 'PPE categories below threshold',
      count: lowStockItems.length,
      description: 'Replenish before issuing new work permits.',
      action: () => navigate('/ppe/stock-position'),
    },
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          HSSE Control Room
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Only the work that protects the site today—no vanity charts.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 480 }}>
            {error}
          </Alert>
        ) : (
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Immediate actions
              </Typography>
              <List dense disablePadding>
                {immediateActions.map((item) => (
                  <ListItemButton
                    key={item.label}
                    onClick={item.action}
                    sx={{ borderRadius: 1, mb: 1, '&:last-of-type': { mb: 0 } }}
                  >
                    <ListItemText
                      primary={`${item.count} — ${item.label}`}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Recent document activity</Typography>
                  <Button size="small" onClick={() => navigate('/document-management/library')}>
                    Open library
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {documentSummary?.recent_activities?.length ? (
                  <List dense disablePadding>
                    {documentSummary.recent_activities.slice(0, 5).map((activity) => (
                      <ListItemText
                        key={activity.id}
                        primary={`${activity.document_title} — ${activity.action}`}
                        secondary={`${activity.performed_by} • ${new Date(activity.created_at).toLocaleString()}`}
                        sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                      />
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No updates in the past 24 hours.
                  </Typography>
                )}
              </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Your CAPAs</Typography>
                <Button size="small" onClick={() => navigate('/audit/capa-management')}>
                  Manage CAPAs
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {openCapas.length ? (
                <List dense disablePadding>
                  {openCapas.slice(0, 5).map((capa) => (
                    <ListItemText
                      key={capa.id}
                      primary={`${capa.title} (${capa.priority})`}
                      secondary={`Due ${new Date(capa.due_date).toLocaleDateString()} • ${capa.status}`}
                      sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  All assigned CAPAs are closed. Great job.
                </Typography>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Inventory alerts</Typography>
                <Button size="small" onClick={() => navigate('/ppe/inventory')}>
                  View inventory
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {lowStockItems.length ? (
                <List dense disablePadding>
                  {lowStockItems.slice(0, 6).map((item) => (
                    <ListItemText
                      key={item.ppe_category.id}
                      primary={item.ppe_category.name}
                      secondary={`Current stock: ${item.current_stock} units`}
                      sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No stockouts detected.
                </Typography>
              )}
            </Paper>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;

