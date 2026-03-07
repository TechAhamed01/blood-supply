from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsHospitalUser(permissions.BasePermission):
    """Allow access only to hospital users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'HOSPITAL'

class IsBloodBankUser(permissions.BasePermission):
    """Allow access only to blood bank users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'BLOODBANK'

class IsAdminOrReadOwnHospital(permissions.BasePermission):
    """
    Admin can view any hospital; hospital users can only view their own.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'ADMIN':
            return True
        if user.role == 'HOSPITAL' and user.hospital == obj:
            return True
        return False

class IsAdminOrReadOwnBloodBank(permissions.BasePermission):
    """
    Admin can view any blood bank; blood bank users can only view their own.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'ADMIN':
            return True
        if user.role == 'BLOODBANK' and user.bloodbank == obj:
            return True
        return False