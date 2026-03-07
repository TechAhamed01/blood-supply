from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/hospitals/', include('apps.hospitals.urls')),
    path('api/bloodbanks/', include('apps.bloodbanks.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/allocation/', include('apps.allocation.urls')),
    path('api/ai/', include('apps.ai_engine.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)