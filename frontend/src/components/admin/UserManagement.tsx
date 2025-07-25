import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  position: string;
  department: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  date_joined: string;
}

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  position: string;
  department: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

const UserManagement: React.FC = () => {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'EMPLOYEE',
    position: '',
    department: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
  });

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'EMPLOYEE', label: 'Employee' },
  ];

  const positions = [
    { value: 'MD', label: 'MD' },
    { value: 'OPS MANAGER', label: 'Ops Manager' },
    { value: 'FINANCE MANAGER', label: 'Finance Manager' },
    { value: 'HSSE MANAGER', label: 'HSSE Manager' },
    { value: 'TECHNICIAN', label: 'Technician' },
  ];

  const departments = [
    { value: 'OPERATIONS', label: 'Operations' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'HSSE', label: 'HSSE' },
    { value: 'FINANCE', label: 'Finance' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axiosInstance.post('/create-user/', formData);
      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await axiosInstance.put(`/users/${editingUser.id}/`, formData);
      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axiosInstance.delete(`/users/${userId}/`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role: user.role,
      position: user.position,
      department: user.department,
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      role: 'EMPLOYEE',
      position: '',
      department: '',
      is_active: true,
      is_staff: false,
      is_superuser: false,
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return theme.palette.error.main;
      case 'MANAGER':
        return theme.palette.warning.main;
      case 'EMPLOYEE':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? theme.palette.success.main : theme.palette.error.main;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and permissions across the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
            },
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              label="Department"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <IconButton onClick={fetchUsers} sx={{ color: theme.palette.text.secondary }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ backgroundColor: theme.palette.error.main }}>
                          {user.first_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={roles.find(r => r.value === user.role)?.label || user.role}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getRoleColor(user.role), 0.1),
                          color: getRoleColor(user.role),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {positions.find(p => p.value === user.position)?.label || user.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {departments.find(d => d.value === user.department)?.label || user.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.is_active ? <LockOpenIcon /> : <LockIcon />}
                        label={user.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getStatusColor(user.is_active), 0.1),
                          color: getStatusColor(user.is_active),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditUser(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                            sx={{ color: theme.palette.error.main }}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                label="Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                label="Position"
              >
                {positions.map((position) => (
                  <MenuItem key={position.value} value={position.value}>
                    {position.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active Account"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_staff}
                  onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                />
              }
              label="Staff Status"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_superuser}
                  onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                />
              }
              label="Superuser"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
              },
            }}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 