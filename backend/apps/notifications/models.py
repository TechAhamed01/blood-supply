from django.db import models
from apps.users.models import User

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('EMERGENCY', 'Emergency'),
        ('STATUS_UPDATE', 'Status Update'),
        ('SYSTEM', 'System'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='SYSTEM')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title} to {self.user.username}"
