from rest_framework.permissions import BasePermission

class IsHSSEManager(BasePermission):
    """
    Allows access only to users with the HSSE Manager position.
    """
    message = "You must be an HSSE Manager to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.position == 'HSSE MANAGER' 