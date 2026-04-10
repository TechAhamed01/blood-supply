from rest_framework import generics, permissions
from .models import Hospital, HospitalInventory
from .serializers import HospitalSerializer, HospitalInventorySerializer
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

class HospitalInventoryView(generics.ListCreateAPIView):
    serializer_class = HospitalInventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HospitalInventory.objects.filter(hospital=self.request.user.hospital)

    def perform_create(self, serializer):
        # Update if exists, else create
        inventory, created = HospitalInventory.objects.update_or_create(
            hospital=self.request.user.hospital,
            blood_group=serializer.validated_data['blood_group'],
            defaults={'units_available': serializer.validated_data['units_available']}
        )