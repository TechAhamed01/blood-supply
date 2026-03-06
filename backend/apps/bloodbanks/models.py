

# Create your models here.
from django.db import models
from apps.users.models import User

class BloodBank(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='bloodbank_profile', null=True, blank=True)
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    contact = models.CharField(max_length=20)
    storage_capacity = models.IntegerField(help_text="Maximum units the bank can store")
    component_separation_available = models.BooleanField(default=False)
    operational_status = models.CharField(
        max_length=20,
        choices=[('ACTIVE', 'Active'), ('MAINTENANCE', 'Maintenance')],
        default='ACTIVE'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name