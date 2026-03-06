

# Create your models here.
from django.db import models
from apps.users.models import User

class Hospital(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hospital_profile', null=True, blank=True)
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    contact = models.CharField(max_length=20)
    capacity = models.IntegerField(help_text="Number of beds")
    avg_daily_surgeries = models.IntegerField(default=0)
    emergency_cases_per_day = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name