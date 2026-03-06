from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import BloodBank
from .serializers import BloodBankSerializer

class BloodBankViewSet(viewsets.ModelViewSet):
    queryset = BloodBank.objects.all()
    serializer_class = BloodBankSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return BloodBank.objects.all()
        elif user.role == 'BLOODBANK' and hasattr(user, 'bloodbank_profile'):
            return BloodBank.objects.filter(id=user.bloodbank_profile.id)
        return BloodBank.objects.none()