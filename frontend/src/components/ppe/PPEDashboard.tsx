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
import { useAuth } from '../../context/AuthContext';

interface StockPositionItem {
  ppe_category: { id: number; name: string };
  current_stock: number;
  is_low_stock: boolean;
}

interface LowStockAlert {
  ppe_category: { name: string };
  current_stock: number;
  threshold: number;
}

interface ExpiryAlert {
  ppe_issue: {
    id: number;
    employee: { first_name: string; last_name: string };
    ppe_category: { name: string };
    expiry_date: string;
  };
  days_until_expiry: number;
  is_expired: boolean;
}

const PPEDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<StockPositionItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [stockResult, lowStockResult, expiryResult] = await Promise.allSettled([
          axiosInstance.get<StockPositionItem[]>('/ppes/dashboard/stock-position/'),
          axiosInstance.get<LowStockAlert[]>('/ppes/dashboard/low-stock-alerts/'),
          axiosInstance.get<ExpiryAlert[]>('/ppes/dashboard/expiry-alerts/'),
        ]);

        if (!cancelled) {
          if (stockResult.status === 'fulfilled') {
            setStock(stockResult.value.data);
          }
          if (lowStockResult.status === 'fulfilled') {
            setLowStockAlerts(lowStockResult.value.data);
          }
          if (expiryResult.status === 'fulfilled') {
            setExpiryAlerts(expiryResult.value.data);
          }
        }

        if (
          stockResult.status === 'rejected' &&
          lowStockResult.status === 'rejected' &&
          expiryResult.status === 'rejected'
        ) {
          throw new Error('Unable to load PPE dashboard data');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Unable to load PPE dashboard data');
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

  const personalExpiryAlerts = useMemo(() => {
    const isHSSE =
      user?.is_superuser ||
      user?.is_staff ||
      user?.position?.toLowerCase().includes('hsse') ||
      user?.role === 'HSSE_MANAGER';

    if (isHSSE) {
      return expiryAlerts;
    }

    return expiryAlerts.filter(
      (alert) =>
        alert.ppe_issue.employee.first_name === user?.first_name &&
        alert.ppe_issue.employee.last_name === user?.last_name
    );
  }, [expiryAlerts, user]);

  const summary = [
    {
      label: 'Low stock categories',
      value: lowStockAlerts.length,
      route: '/ppe/stock-position',
      description: 'Reorder before issuing new permits.',
    },
    {
      label: 'Expiring PPE assignments',
      value: personalExpiryAlerts.filter((alert) => alert.days_until_expiry <= 30 && !alert.is_expired).length,
      route: '/ppe/issues',
      description: 'Retrieve equipment before expiry.',
    },
    {
      label: 'Total tracked categories',
      value: stock.length,
      route: '/ppe/inventory',
      description: 'Review stock distribution.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            PPE readiness board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Minimal signals to keep workers equipped and compliant.
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
                Summary actions
              </Typography>
              <List disablePadding>
                {summary.map((item) => (
                  <ListItemText
                    key={item.label}
                    primary={`${item.value} · ${item.label}`}
                    secondary={item.description}
                    sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    primaryTypographyProps={{ fontWeight: 600, sx: { cursor: 'pointer' } }}
                    onClick={() => navigate(item.route)}
                  />
                ))}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Low stock alerts</Typography>
                <Button size="small" onClick={() => navigate('/ppe/stock-position')}>
                  Open stock view
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {lowStockAlerts.length ? (
                <List disablePadding>
                  {lowStockAlerts.slice(0, 10).map((alert, index) => (
                    <ListItemText
                      key={`${alert.ppe_category.name}-${index}`}
                      primary={alert.ppe_category.name}
                      secondary={`Current: ${alert.current_stock} · Threshold: ${alert.threshold}`}
                      sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Inventory is healthy.
                </Typography>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Upcoming expiries</Typography>
                <Button size="small" onClick={() => navigate('/ppe/issues')}>
                  View assignments
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {personalExpiryAlerts.length ? (
                <List disablePadding>
                  {personalExpiryAlerts.slice(0, 10).map((alert) => (
                    <ListItemText
                      key={alert.ppe_issue.id}
                      primary={`${alert.ppe_issue.ppe_category.name} — ${alert.days_until_expiry <= 0 ? 'Expired' : `${alert.days_until_expiry} days remaining`}`}
                      secondary={`Employee: ${alert.ppe_issue.employee.first_name} ${alert.ppe_issue.employee.last_name} · Expires ${new Date(alert.ppe_issue.expiry_date).toLocaleDateString()}`}
                      sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}
                    />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No PPE items near expiry.
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default PPEDashboard;

