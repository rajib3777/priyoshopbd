"""
Common permissions for PriyoShop API.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    """Allow access only to admin/staff users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsSuperAdmin(BasePermission):
    """Allow access only to superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class IsOwnerOrAdmin(BasePermission):
    """Allow access to object owner or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'customer', None)
        if owner is None:
            return False
        if hasattr(owner, 'user'):
            return owner.user == request.user
        return owner == request.user


class IsAdminOrReadOnly(BasePermission):
    """Safe methods for all, write methods for admin only."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class HasRolePermission(BasePermission):
    """
    Check if admin user has a specific role permission.
    Usage: set `required_permission = 'products.change'` on view.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        required = getattr(view, 'required_permission', None)
        if not required:
            return True
        return request.user.has_role_permission(required)
