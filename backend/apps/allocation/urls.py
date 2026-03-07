from django.urls import path
from .views import AllocationRequestListCreateView, AllocationRequestDetailView, FulfillAllocationView

urlpatterns = [
    path('requests/', AllocationRequestListCreateView.as_view(), name='allocation-list'),
    path('requests/<int:pk>/', AllocationRequestDetailView.as_view(), name='allocation-detail'),
    path('requests/<int:pk>/fulfill/', FulfillAllocationView.as_view(), name='allocation-fulfill'),
]