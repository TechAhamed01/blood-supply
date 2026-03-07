from rest_framework import generics, permissions
from .models import Hospital
from .serializers import HospitalSerializer
from apps.users.permissions import IsAdminOrReadOwnHospital

class HospitalListView(generics.ListAPIView):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]

class HospitalDetailView(generics.RetrieveAPIView):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminOrReadOwnHospital]
    lookup_field = 'hospital_id'