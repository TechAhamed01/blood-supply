from rest_framework import generics, permissions
from .models import BloodBank
from .serializers import BloodBankSerializer
from apps.users.permissions import IsAdminOrReadOwnBloodBank

class BloodBankListView(generics.ListAPIView):
    queryset = BloodBank.objects.all()
    serializer_class = BloodBankSerializer
    permission_classes = [permissions.IsAuthenticated]

class BloodBankDetailView(generics.RetrieveAPIView):
    queryset = BloodBank.objects.all()
    serializer_class = BloodBankSerializer
    permission_classes = [IsAdminOrReadOwnBloodBank]
    lookup_field = 'bloodbank_id' 