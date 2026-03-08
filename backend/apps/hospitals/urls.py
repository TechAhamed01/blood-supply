from django.urls import path
from .views import HospitalListView, HospitalDetailView

urlpatterns = [
    path('', HospitalListView.as_view(), name='hospital-list'),
    path('<int:hospital_id>/', HospitalDetailView.as_view(), name='hospital-detail'),  # changed from <int:pk>
]