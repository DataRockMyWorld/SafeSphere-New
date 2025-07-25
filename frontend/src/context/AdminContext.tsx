import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstance';

interface AdminPermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageDepartments: boolean;
  canViewSystemLogs: boolean;
  canManageSecurity: boolean;
  canCreateSuperusers: boolean;
  canDeleteUsers: boolean;
  canEditUsers: boolean;
  canViewUserDetails: boolean;
}

interface AdminContextType {
  permissions: AdminPermissions;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canManageUsers: false,
    canManageRoles: false,
    canManageDepartments: false,
    canViewSystemLogs: false,
    canManageSecurity: false,
    canCreateSuperusers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canViewUserDetails: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser === true;

  const checkPermissions = (): AdminPermissions => {
    if (!user) {
      return {
        canManageUsers: false,
        canManageRoles: false,
        canManageDepartments: false,
        canViewSystemLogs: false,
        canManageSecurity: false,
        canCreateSuperusers: false,
        canDeleteUsers: false,
        canEditUsers: false,
        canViewUserDetails: false,
      };
    }

    // Superuser has all permissions
    if (user.is_superuser) {
      return {
        canManageUsers: true,
        canManageRoles: true,
        canManageDepartments: true,
        canViewSystemLogs: true,
        canManageSecurity: true,
        canCreateSuperusers: true,
        canDeleteUsers: true,
        canEditUsers: true,
        canViewUserDetails: true,
      };
    }

    // Admin role permissions
    if (user.role === 'ADMIN') {
      return {
        canManageUsers: true,
        canManageRoles: true,
        canManageDepartments: true,
        canViewSystemLogs: true,
        canManageSecurity: true,
        canCreateSuperusers: false, // Only superusers can create superusers
        canDeleteUsers: true,
        canEditUsers: true,
        canViewUserDetails: true,
      };
    }

    // Manager role permissions
    if (user.role === 'MANAGER') {
      return {
        canManageUsers: true,
        canManageRoles: false,
        canManageDepartments: false,
        canViewSystemLogs: false,
        canManageSecurity: false,
        canCreateSuperusers: false,
        canDeleteUsers: false,
        canEditUsers: true,
        canViewUserDetails: true,
      };
    }

    // Employee role - no admin permissions
    return {
      canManageUsers: false,
      canManageRoles: false,
      canManageDepartments: false,
      canViewSystemLogs: false,
      canManageSecurity: false,
      canCreateSuperusers: false,
      canDeleteUsers: false,
      canEditUsers: false,
      canViewUserDetails: false,
    };
  };

  const refreshPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you might fetch permissions from the server
      // For now, we'll use the local permission checking
      const newPermissions = checkPermissions();
      setPermissions(newPermissions);
    } catch (err) {
      setError('Failed to refresh permissions');
      console.error('Error refreshing permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshPermissions();
    }
  }, [user]);

  const value: AdminContextType = {
    permissions,
    isAdmin,
    isLoading,
    error,
    refreshPermissions,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext; 