from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AllocationRequestViewSet

router = DefaultRouter()
router.register(r'requests', AllocationRequestViewSet, basename='allocation-request')

urlpatterns = [
    path('', include(router.urls)),
]