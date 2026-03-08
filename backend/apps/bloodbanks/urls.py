from django.urls import path
from .views import BloodBankListView, BloodBankDetailView

urlpatterns = [
    path('', BloodBankListView.as_view(), name='bloodbank-list'),
    path('<int:bloodbank_id>/', BloodBankDetailView.as_view(), name='bloodbank-detail'),
]