from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Inventory, BLOOD_GROUP_CHOICES
from .serializers import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Inventory.objects.all()
        elif user.role == 'BLOODBANK' and hasattr(user, 'bloodbank_profile'):
            return Inventory.objects.filter(bloodbank=user.bloodbank_profile)
        return Inventory.objects.none()

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Return total available units per blood group for the current blood bank."""
        user = request.user
        if user.role != 'BLOODBANK' or not hasattr(user, 'bloodbank_profile'):
            return Response({'error': 'Access denied'}, status=403)
        bb = user.bloodbank_profile
        summary = Inventory.objects.filter(bloodbank=bb, expiry_date__gt=date.today()) \
            .values('blood_group') \
            .annotate(total=Sum('units_available')) \
            .order_by('blood_group')
        return Response(summary)