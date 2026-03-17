from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from datetime import date
from .models import Donor, DonationHistory, Notification
from apps.bloodbanks.models import BloodBank
from .serializers import (
    DonorDetailSerializer, DonationHistorySerializer,
    NotificationSerializer, DonorMinimalSerializer,
    DonorTokenObtainSerializer  # Make sure this import exists
)
from .authentication import DonorJWTAuthentication
from .permissions import IsDonorUser
from apps.bloodbanks.serializers import BloodBankSerializer
from apps.users.models import User
from rest_framework.permissions import IsAuthenticated

# Add this view
class DonorTokenObtainPairView(TokenObtainPairView):
    serializer_class = DonorTokenObtainSerializer

class DonorDashboardView(APIView):
    authentication_classes = [DonorJWTAuthentication]
    permission_classes = [IsDonorUser]

    def get(self, request):
        donor = request.user
        serializer = DonorDetailSerializer(donor)
        return Response(serializer.data)

class DonationHistoryView(APIView):
    authentication_classes = [DonorJWTAuthentication]
    permission_classes = [IsDonorUser]

    def get(self, request):
        donor = request.user
        history = DonationHistory.objects.filter(donor=donor).order_by('-donation_date')
        serializer = DonationHistorySerializer(history, many=True)
        return Response(serializer.data)

class NotificationListView(APIView):
    authentication_classes = [DonorJWTAuthentication]
    permission_classes = [IsDonorUser]

    def get(self, request):
        donor = request.user
        notifications = Notification.objects.filter(donor=donor).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class MarkNotificationReadView(APIView):
    authentication_classes = [DonorJWTAuthentication]
    permission_classes = [IsDonorUser]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, donor=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'marked read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class NearbyBloodBanksView(APIView):
    authentication_classes = [DonorJWTAuthentication]
    permission_classes = [IsDonorUser]

    def get(self, request):
        donor = request.user
        banks = BloodBank.objects.filter(city=donor.city, operational_status='Active')
        serializer = BloodBankSerializer(banks, many=True)
        return Response(serializer.data)

# For blood bank dashboard
class EligibleDonorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is a blood bank
        if not hasattr(request.user, 'role') or request.user.role != 'BLOODBANK':
            return Response(
                {'error': 'Only blood banks can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the blood bank associated with this user
        bloodbank = request.user.bloodbank
        if not bloodbank:
            return Response(
                {'error': 'No blood bank associated with this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get eligible donors in the same city
        donors = Donor.objects.filter(
            city=bloodbank.city,
            eligibility_status='Eligible Now',
            is_active=True
        ).order_by('name')
        
        serializer = DonorMinimalSerializer(donors, many=True)
        return Response(serializer.data)

class SendNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is a blood bank
        if not hasattr(request.user, 'role') or request.user.role != 'BLOODBANK':
            return Response(
                {'error': 'Only blood banks can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        bloodbank = request.user.bloodbank
        if not bloodbank:
            return Response(
                {'error': 'No blood bank associated with this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        blood_group = request.data.get('blood_group')
        message = request.data.get('message', 'Urgent blood needed!')

        donors = Donor.objects.filter(
            city=bloodbank.city,
            eligibility_status='Eligible Now',
            is_active=True
        )
        if blood_group:
            donors = donors.filter(blood_group=blood_group)

        count = 0
        for donor in donors:
            Notification.objects.create(
                donor=donor,
                bloodbank=bloodbank,
                type='SHORTAGE',
                message=message
            )
            count += 1
            
        return Response({
            'status': 'success',
            'message': f'Notifications sent to {count} donors'
        })