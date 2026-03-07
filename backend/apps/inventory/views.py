from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Inventory
from .serializers import InventorySerializer
from apps.users.permissions import IsBloodBankUser, IsAdminUser


class InventoryListCreateView(generics.ListCreateAPIView):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Inventory.objects.all()
        elif user.role == 'BLOODBANK':
            return Inventory.objects.filter(bloodbank=user.bloodbank)
        else:  # hospital can view all? maybe only list, but not create
            return Inventory.objects.all()  # or restrict to public?

    def perform_create(self, serializer):
        # Only bloodbank users can create
        if self.request.user.role != 'BLOODBANK':
            self.permission_denied(self.request)
        serializer.save(bloodbank=self.request.user.bloodbank)

class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Inventory.objects.all()
        elif user.role == 'BLOODBANK':
            return Inventory.objects.filter(bloodbank=user.bloodbank)
        return Inventory.objects.none()  # hospitals cannot access detail