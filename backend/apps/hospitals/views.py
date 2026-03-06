from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Hospital
from .serializers import HospitalSerializer

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Hospital.objects.all()
        elif user.role == 'HOSPITAL' and hasattr(user, 'hospital_profile'):
            return Hospital.objects.filter(id=user.hospital_profile.id)
        # Blood bank users may need read access? For now, return empty
        return Hospital.objects.none()