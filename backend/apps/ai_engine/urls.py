from django.urls import path
from . import views

urlpatterns = [
    path('demand-forecast/', views.DemandForecastView.as_view(), name='demand-forecast'),
    path('shortage-risks/', views.ShortageRisksView.as_view(), name='shortage-risks'),
    path('delivery-time/', views.DeliveryTimeView.as_view(), name='delivery-time'),
]