# SafeSphere PPE Management Permission System

## Overview

The PPE Management Permission System implements role-based access control (RBAC) for Personal Protective Equipment management features. This system ensures that only authorized personnel can perform sensitive operations while maintaining appropriate access levels for all users.

## 🔐 Permission Structure

### **HSSE Manager & Superuser (Full Access)**
- ✅ **Inventory Management** - Full read/write access
- ✅ **Purchases** - Full read/write access  
- ✅ **Vendor Management** - Full read/write access
- ✅ **Stock Monitoring** - Full read/write access
- ✅ **Stock Position** - Full read/write access
- ✅ **PPE Register** - Full read/write access
- ✅ **Issuance** - Full read/write access (can see all PPE issued)
- ✅ **Settings** - Full access to PPE settings
- ✅ **All other features** - Full access

### **Other Users (Limited Access)**
- ✅ **Stock Monitoring** - Read-only access
- ✅ **Stock Position** - Read-only access
- ✅ **PPE Register** - Read-only access
- ✅ **Issuance** - Read-only access (can only see their own PPE issued)
- ✅ **Requests** - Full access (can submit and manage their own requests)
- ✅ **Returns** - Full access (can submit and manage their own returns)
- ✅ **Damage Reports** - Full access (can submit damage reports)
- ❌ **Inventory Management** - Hidden/No access
- ❌ **Purchases** - Hidden/No access
- ❌ **Vendor Management** - Hidden/No access
- ❌ **Settings** - Hidden/No access

## 🏗️ Architecture

### Core Components

1. **PPEPermissionContext** (`context/PPEPermissionContext.tsx`)
   - Manages PPE-specific permissions and state
   - Provides role-based permission checking
   - Handles permission updates and caching

2. **ProtectedPPERoute** (`components/ppe/ProtectedPPERoute.tsx`)
   - Secures PPE routes with permission-based access control
   - Provides user-friendly access denied messages
   - Handles loading states during permission checks

3. **PPEManagementLayout** (`components/ppe/PPEManagementLayout.tsx`)
   - Dynamic navigation based on user permissions
   - Filters menu items based on access rights
   - Integrated with permission context

### Permission Matrix

| Feature | HSSE Manager | Superuser | Other Users |
|---------|-------------|-----------|-------------|
| **Inventory Management** | ✅ Full | ✅ Full | ❌ Hidden |
| **Purchases** | ✅ Full | ✅ Full | ❌ Hidden |
| **Vendor Management** | ✅ Full | ✅ Full | ❌ Hidden |
| **Stock Monitoring** | ✅ Full | ✅ Full | ✅ Read Only |
| **Stock Position** | ✅ Full | ✅ Full | ✅ Read Only |
| **PPE Register** | ✅ Full | ✅ Full | ✅ Read Only |
| **Issuance** | ✅ Full (All) | ✅ Full (All) | ✅ Read Only (Own) |
| **Requests** | ✅ Full | ✅ Full | ✅ Full |
| **Returns** | ✅ Full | ✅ Full | ✅ Full |
| **Damage Reports** | ✅ Full | ✅ Full | ✅ Full |
| **Settings** | ✅ Full | ✅ Full | ❌ Hidden |

## 🚀 Features

### Security Features
- **Role-based Access Control**: Granular permission system
- **Route Protection**: Secure PPE routes with permission checks
- **Dynamic Navigation**: Menu items filtered by permissions
- **User-friendly Messages**: Clear access denied notifications

### User Experience
- **Seamless Access**: Users only see features they can access
- **Clear Feedback**: Informative messages for restricted access
- **Consistent Interface**: Same layout, different content based on permissions

### Administrative Features
- **Permission Management**: Centralized permission control
- **Audit Trail**: Future implementation for access logging
- **Flexible Configuration**: Easy to modify permission rules

## 📁 File Structure

```
src/
├── context/
│   └── PPEPermissionContext.tsx    # PPE permission management
├── components/
│   └── ppe/
│       ├── PPEManagementLayout.tsx # Main PPE layout with permissions
│       ├── ProtectedPPERoute.tsx   # Route protection component
│       ├── InventoryManagement.tsx # Protected component
│       ├── Purchases.tsx          # Protected component
│       ├── Vendors.tsx            # Protected component
│       ├── Settings.tsx           # Protected component
│       └── README.md              # This documentation
└── App.tsx                        # Route configuration with protection
```

## 🔧 Implementation Details

### Permission Context Usage

```typescript
// In any PPE component
import { usePPEPermissions } from '../../context/PPEPermissionContext';

const MyComponent = () => {
  const { permissions, isHSSEManager } = usePPEPermissions();
  
  if (!permissions.canManageInventory) {
    return <AccessDenied />;
  }
  
  return <InventoryManagement />;
};
```

### Route Protection

```typescript
// In App.tsx
<Route path="inventory" element={
  <ProtectedPPERoute requiredPermission="canManageInventory">
    <InventoryManagement />
  </ProtectedPPERoute>
} />
```

### Menu Filtering

```typescript
// In PPEManagementLayout.tsx
{menuItems
  .filter(item => {
    switch (item.path) {
      case '/ppe/inventory':
        return permissions.canManageInventory;
      case '/ppe/purchases':
        return permissions.canManagePurchases;
      // ... other cases
    }
  })
  .map(item => <MenuItem key={item.path} {...item} />)
}
```

## 🎯 Business Logic

### Why This Structure?

1. **Security**: HSSE Managers are responsible for PPE procurement and inventory
2. **Compliance**: Ensures only authorized personnel can modify critical PPE data
3. **User Experience**: Regular users can still view stock levels and submit requests
4. **Audit Trail**: Clear separation of responsibilities and access levels

### Permission Rationale

- **Inventory Management**: Only HSSE Managers should add/remove PPE items
- **Purchases**: Only HSSE Managers should manage procurement
- **Vendor Management**: Only HSSE Managers should manage supplier relationships
- **Stock Monitoring**: All users can view but only managers can modify
- **Stock Position**: All users can view but only managers can modify
- **PPE Register**: All users can view but only managers can modify
- **Issuance**: HSSE Managers see all PPE issued, regular users see only their own
- **Requests/Returns/Damage Reports**: All users can manage their own submissions

## 🔮 Future Enhancements

### Phase 2: Advanced Features
- [ ] Department-specific permissions
- [ ] Approval workflows for PPE requests
- [ ] Advanced audit logging
- [ ] Bulk operations with permission checks

### Phase 3: Integration Features
- [ ] Integration with document management
- [ ] Email notifications for permission changes
- [ ] Mobile app permission synchronization
- [ ] API-level permission enforcement

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user position and role
   - Verify PPEPermissionContext is properly configured
   - Ensure backend API permissions are set

2. **Menu Items Not Showing**
   - Check permission filtering logic
   - Verify user role assignment
   - Review menu item path matching

3. **Route Access Issues**
   - Verify ProtectedPPERoute implementation
   - Check authentication state
   - Review permission requirements

### Debug Mode
Enable debug logging by setting `DEBUG=true` in environment variables.

## 📝 Contributing

1. Follow the existing permission structure
2. Add proper TypeScript types
3. Include error handling
4. Add loading states
5. Test with different user roles
6. Update documentation

## 📄 License

This permission system is part of the SafeSphere project and follows the same licensing terms. 