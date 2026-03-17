from rest_framework import permissions

class IsDonorUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'donor_id')