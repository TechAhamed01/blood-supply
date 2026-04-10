from django.db import models
from apps.users.models import User

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('EMERGENCY', 'Emergency'),
        ('STATUS_UPDATE', 'Status Update'),
        ('SYSTEM', 'System'),
        ('SHORTAGE', 'Shortage Alert'),
        ('ELIGIBLE', 'Eligibility Reminder'),
        ('CAMPAIGN', 'Donation Camp'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    donor = models.ForeignKey('donors.Donor', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    bloodbank = models.ForeignKey('bloodbanks.BloodBank', on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='SYSTEM')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        recipient = self.user.username if self.user else (self.donor.donor_id if self.donor else "Unknown")
        return f"[{self.notification_type}] {self.title or self.message[:20]} to {recipient}"
