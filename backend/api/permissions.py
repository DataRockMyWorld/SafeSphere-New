from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsHSSEManager(BasePermission):
    """
    Allows access only to users with the HSSE Manager position.
    """
    message = "You must be an HSSE Manager to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.position == 'HSSE MANAGER'


class IsHSSEManagerOrReadOnly(BasePermission):
    """
    Custom permission: 
    - HSSE Managers and Admins have full access
    - Regular users have read-only access
    """
    message = "You must be an HSSE Manager or Admin to modify this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions are allowed to any authenticated user
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions only for HSSE Manager or Admin
        return request.user.position == 'HSSE MANAGER' or request.user.is_superuser


class LegalCompliancePermission(BasePermission):
    """
    Custom permission for Legal Compliance module:
    - Regular users: Read-only access to Law Library ONLY
    - HSSE Managers/Admins: Full access to everything
    """
    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # HSSE Manager and Admin have full access to everything
        if request.user.position == 'HSSE MANAGER' or request.user.is_superuser:
            return True
        
        # Regular users: Read-only access to Law Library only
        # Check if this is a Law Library related view
        view_name = view.__class__.__name__
        if 'LawResource' in view_name or 'LawCategory' in view_name:
            # Allow GET requests only
            return request.method in SAFE_METHODS
        
        # Deny access to all other legal compliance features
        return False


class PPEManagementPermission(BasePermission):
    """
    Custom permission for PPE Management module:
    - Regular users: Can ONLY make requests and report damage
    - HSSE Managers/Admins: Full access to everything
    """
    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # HSSE Manager and Admin have full access to everything
        if request.user.position == 'HSSE MANAGER' or request.user.is_superuser:
            return True
        
        # Regular users: Only Requests and Damage Reports
        view_name = view.__class__.__name__
        
        # Allow PPE Request views (create and view own)
        if 'PPERequest' in view_name:
            # Allow POST to create, GET to view own requests (filtered in view)
            return request.method in ['GET', 'POST', 'HEAD', 'OPTIONS']
        
        # Allow PPE Damage Report views (create and view own)
        if 'PPEDamageReport' in view_name:
            # Allow POST to create, GET to view own reports (filtered in view)
            return request.method in ['GET', 'POST', 'HEAD', 'OPTIONS']
        
        # Deny access to all other PPE features
        return False


class AuditManagementPermission(BasePermission):
    """
    Custom permission for Audit Management module:
    - Regular users: NO ACCESS (completely restricted)
    - HSSE Managers/Admins: Full access to everything
    """
    message = "You do not have permission to access the Audit Management module. Only HSSE Managers and Admins can access audits."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only HSSE Manager and Admin have access
        return request.user.position == 'HSSE MANAGER' or request.user.is_superuser


class RiskManagementPermission(BasePermission):
    """
    Custom permission for Risk Management module:
    - Regular users: Read-only access to Risk Matrix and Risk Register ONLY
    - HSSE Managers/Admins: Full access to everything
    """
    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # HSSE Manager and Admin have full access to everything
        if request.user.position == 'HSSE MANAGER' or request.user.is_superuser:
            return True
        
        # Regular users: Read-only access to Matrix Config and Assessments
        view_name = view.__class__.__name__
        
        # Allow Risk Matrix Config view (read-only)
        if 'RiskMatrixConfig' in view_name:
            return request.method in SAFE_METHODS
        
        # Allow Risk Assessment views (read-only)
        if 'RiskAssessment' in view_name:
            return request.method in SAFE_METHODS
        
        # Deny access to Dashboard and other features
        return False 