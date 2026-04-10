from django.urls import path
from .views import HospitalListView, HospitalDetailView, HospitalInventoryView

urlpatterns = [
    path('', HospitalListView.as_view(), name='hospital-list'),
    path('inventory/', HospitalInventoryView.as_view(), name='hospital-inventory'),
    path('<int:hospital_id>/', HospitalDetailView.as_view(), name='hospital-detail'),  # changed from <int:pk>
]