from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/hospitals/', include('apps.hospitals.urls')),
    path('api/bloodbanks/', include('apps.bloodbanks.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/allocation/', include('apps.allocation.urls')),
    # AI engine APIs are separate (if needed)
    path('api/ai/', include('apps.ai_engine.urls')),
]