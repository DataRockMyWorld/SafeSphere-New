import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface PPECategory {
  id: number;
  name: string;
  description: string;
  lifespan_months: number;
  low_stock_threshold: number;
  is_active: boolean;
  default_image_url?: string;
  current_stock?: number;
  is_low_stock?: boolean;
}

const PPERegister: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [categories, setCategories] = useState<PPECategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PPECategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lifespan_months: 12,
    low_stock_threshold: 10,
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/ppes/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching PPE categories:', err);
      setError('Failed to load PPE categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDialog = (category?: PPECategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        lifespan_months: category.lifespan_months,
        low_stock_threshold: category.low_stock_threshold,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        lifespan_months: 12,
        low_stock_threshold: 10,
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await axiosInstance.put(`/ppes/categories/${editingCategory.id}/`, formData);
      } else {
        await axiosInstance.post('/ppes/categories/', formData);
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      console.error('Error saving PPE category:', err);
      setError('Failed to save PPE category');
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this PPE category?')) {
      try {
        await axiosInstance.delete(`/ppes/categories/${categoryId}/`);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting PPE category:', err);
        setError('Failed to delete PPE category');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            PPE Register
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage PPE categories and their specifications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCategories}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Categories Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lifespan (Months)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Low Stock Threshold</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Current Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 32,
                            height: 32,
                          }}
                        >
                          <CategoryIcon />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.lifespan_months} months
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.low_stock_threshold}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {category.current_stock || 0}
                        </Typography>
                        {category.is_low_stock && (
                          <Chip
                            label="Low Stock"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={category.is_active ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(category.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit PPE Category' : 'Add PPE Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Lifespan (Months)"
              type="number"
              value={formData.lifespan_months}
              onChange={(e) => setFormData({ ...formData, lifespan_months: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Low Stock Threshold"
              type="number"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PPERegister; 