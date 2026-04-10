from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='notification-read'),
    path('read-all/', views.MarkAllNotificationsReadView.as_view(), name='notification-read-all'),
    path('send-to-donors/', views.SendDonorNotificationView.as_view(), name='send-donor-notification'),
]
