import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PPEPermissions {
  canManageInventory: boolean;
  canManagePurchases: boolean;
  canManageVendors: boolean;
  canViewStockMonitoring: boolean;
  canWriteStockMonitoring: boolean;
  canManageIssuance: boolean;
  canViewIssuance: boolean;
  canManageRequests: boolean;
  canManageReturns: boolean;
  canManageDamageReports: boolean;
  canViewPPERegister: boolean;
  canManagePPERegister: boolean;
  canViewStockPosition: boolean;
  canManageStockPosition: boolean;
  canManageSettings: boolean;
}

interface PPEPermissionContextType {
  permissions: PPEPermissions;
  isHSSEManager: boolean;
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const PPEPermissionContext = createContext<PPEPermissionContextType | undefined>(undefined);

interface PPEPermissionProviderProps {
  children: ReactNode;
}

export const PPEPermissionProvider: React.FC<PPEPermissionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PPEPermissions>({
    canManageInventory: false,
    canManagePurchases: false,
    canManageVendors: false,
    canViewStockMonitoring: true, // All users can view
    canWriteStockMonitoring: false,
    canManageIssuance: false,
    canViewIssuance: true, // All users can view their own issuance
    canManageRequests: true, // All users can manage their own requests
    canManageReturns: true, // All users can manage their own returns
    canManageDamageReports: true, // All users can submit damage reports
    canViewPPERegister: true, // All users can view PPE register
    canManagePPERegister: false, // Only HSSE Manager can manage
    canViewStockPosition: true, // All users can view stock position
    canManageStockPosition: false, // Only HSSE Manager can manage
    canManageSettings: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHSSEManager = user?.position === 'HSSE MANAGER' || user?.is_superuser === true;

  const checkPermissions = (): PPEPermissions => {
    if (!user) {
      return {
        canManageInventory: false,
        canManagePurchases: false,
        canManageVendors: false,
        canViewStockMonitoring: false,
        canWriteStockMonitoring: false,
        canManageIssuance: false,
        canViewIssuance: false,
        canManageRequests: false,
        canManageReturns: false,
        canManageDamageReports: false,
        canViewPPERegister: false,
        canManagePPERegister: false,
        canViewStockPosition: false,
        canManageStockPosition: false,
        canManageSettings: false,
      };
    }

    // Superuser has all permissions
    if (user.is_superuser) {
      return {
        canManageInventory: true,
        canManagePurchases: true,
        canManageVendors: true,
        canViewStockMonitoring: true,
        canWriteStockMonitoring: true,
        canManageIssuance: true,
        canViewIssuance: true,
        canManageRequests: true,
        canManageReturns: true,
        canManageDamageReports: true,
        canViewPPERegister: true,
        canManagePPERegister: true,
        canViewStockPosition: true,
        canManageStockPosition: true,
        canManageSettings: true,
      };
    }

    // HSSE Manager permissions
    if (user.position === 'HSSE MANAGER') {
      return {
        canManageInventory: true,
        canManagePurchases: true,
        canManageVendors: true,
        canViewStockMonitoring: true,
        canWriteStockMonitoring: true,
        canManageIssuance: true,
        canViewIssuance: true,
        canManageRequests: true,
        canManageReturns: true,
        canManageDamageReports: true,
        canViewPPERegister: true,
        canManagePPERegister: true,
        canViewStockPosition: true,
        canManageStockPosition: true,
        canManageSettings: true,
      };
    }

    // All other users (read-only access to most features)
    return {
      canManageInventory: false,
      canManagePurchases: false,
      canManageVendors: false,
      canViewStockMonitoring: true,
      canWriteStockMonitoring: false,
      canManageIssuance: false,
      canViewIssuance: true, // Users can view their own issuance
      canManageRequests: true,
      canManageReturns: true,
      canManageDamageReports: true,
      canViewPPERegister: true,
      canManagePPERegister: false, // Only HSSE Manager can manage
      canViewStockPosition: true,
      canManageStockPosition: false, // Only HSSE Manager can manage
      canManageSettings: false,
    };
  };

  const refreshPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPermissions = checkPermissions();
      setPermissions(newPermissions);
    } catch (err) {
      setError('Failed to refresh PPE permissions');
      console.error('Error refreshing PPE permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshPermissions();
    }
  }, [user]);

  const value: PPEPermissionContextType = {
    permissions,
    isHSSEManager,
    isLoading,
    error,
    refreshPermissions,
  };

  return (
    <PPEPermissionContext.Provider value={value}>
      {children}
    </PPEPermissionContext.Provider>
  );
};

export const usePPEPermissions = (): PPEPermissionContextType => {
  const context = useContext(PPEPermissionContext);
  if (context === undefined) {
    throw new Error('usePPEPermissions must be used within a PPEPermissionProvider');
  }
  return context;
};

export default PPEPermissionContext; 