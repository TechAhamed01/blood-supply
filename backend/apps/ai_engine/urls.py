from django.urls import path, include
from .views import (
    DemandForecastAPIView,
    SmartAllocationAPIView,
    DeliveryTimeEstimationAPIView,
    ShortageRiskAPIView
)

urlpatterns = [
    path('demand-forecast/', DemandForecastAPIView.as_view(), name='demand-forecast'),
    path('allocation/', SmartAllocationAPIView.as_view(), name='smart-allocation'),
    path('delivery-time/', DeliveryTimeEstimationAPIView.as_view(), name='delivery-time'),
    path('shortage-risks/', ShortageRiskAPIView.as_view(), name='shortage-risks'),
    
]