from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer

from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.donors.authentication import DonorJWTAuthentication
from apps.donors.permissions import IsDonorUser

class UniversalJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        # Look for donor_id first as it's the primary identifier for donor tokens
        donor_id = validated_token.get('donor_id')
        
        if donor_id:
            from apps.donors.models import Donor
            try:
                return Donor.objects.get(donor_id=donor_id)
            except Donor.DoesNotExist:
                from rest_framework_simplejwt.exceptions import InvalidToken
                raise InvalidToken('Donor not found')
        
        # Fallback to standard user authentication
        try:
            return super().get_user(validated_token)
        except Exception:
            # If standard lookup fails (e.g. string ID for integer field), return None 
            # so DRF can handle authentication failure appropriately
            return None

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    authentication_classes = [UniversalJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated | IsDonorUser]

    def get_queryset(self):
        # Allow filtering by is_read
        if hasattr(self.request.user, 'donor_id'):
            queryset = Notification.objects.filter(donor=self.request.user)
        else:
            queryset = Notification.objects.filter(user=self.request.user)
            
        is_read_param = self.request.query_params.get('is_read')
        if is_read_param is not None:
            is_read = is_read_param.lower() == 'true'
            queryset = queryset.filter(is_read=is_read)
        return queryset

class MarkNotificationReadView(APIView):
    authentication_classes = [UniversalJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated | IsDonorUser]

    def post(self, request, pk):
        try:
            if hasattr(request.user, 'donor_id'):
                notification = Notification.objects.get(pk=pk, donor=request.user)
            else:
                notification = Notification.objects.get(pk=pk, user=request.user)
                
            notification.is_read = True
            notification.save()
            return Response({'status': 'marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class MarkAllNotificationsReadView(APIView):
    authentication_classes = [UniversalJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated | IsDonorUser]

    def post(self, request):
        if hasattr(request.user, 'donor_id'):
            Notification.objects.filter(donor=request.user, is_read=False).update(is_read=True)
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

class SendDonorNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
        message = request.data.get('message', 'Urgent blood needed in your area!')
        
        # We need to import Donor from donors app locally to prevent circular imports if any, or at the top.
        from apps.donors.models import Donor

        donors = Donor.objects.filter(
            city=bloodbank.city,
            is_active=True
        )
        if blood_group:
            donors = donors.filter(blood_group=blood_group)

        count = donors.count()
        if count > 0:
            notifications = [
                Notification(
                    donor=donor,
                    bloodbank=bloodbank,
                    notification_type='SHORTAGE',
                    title='Shortage Alert',
                    message=message
                ) for donor in donors
            ]
            Notification.objects.bulk_create(notifications)
            
        return Response({
            'status': 'success',
            'message': f'Notifications sent to {count} donors'
        })
