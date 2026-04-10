from django.urls import path
from .views import (
    DonorDashboardView, DonationHistoryView,
    NotificationListView, MarkNotificationReadView,
    NearbyBloodBanksView, BloodBankDonorsView, SendNotificationView,
    DonorTokenObtainPairView
)

urlpatterns = [
    path('login/', DonorTokenObtainPairView.as_view(), name='donor_login'),
    path('dashboard/', DonorDashboardView.as_view(), name='donor_dashboard'),
    path('history/', DonationHistoryView.as_view(), name='donor_history'),
    path('notifications/', NotificationListView.as_view(), name='donor_notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('nearby-banks/', NearbyBloodBanksView.as_view(), name='nearby_banks'),
    path('bloodbank-donors/', BloodBankDonorsView.as_view(), name='bloodbank_donors'),
    path('send-notification/', SendNotificationView.as_view(), name='send_notification'),
]