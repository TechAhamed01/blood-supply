from django.urls import path
from .views import (
    DonorDashboardView, DonationHistoryView,
    NearbyBloodBanksView, BloodBankDonorsView,
    DonorTokenObtainPairView
)

urlpatterns = [
    path('login/', DonorTokenObtainPairView.as_view(), name='donor_login'),
    path('dashboard/', DonorDashboardView.as_view(), name='donor_dashboard'),
    path('history/', DonationHistoryView.as_view(), name='donor_history'),
    path('nearby-banks/', NearbyBloodBanksView.as_view(), name='nearby_banks'),
    path('bloodbank-donors/', BloodBankDonorsView.as_view(), name='bloodbank_donors'),
]