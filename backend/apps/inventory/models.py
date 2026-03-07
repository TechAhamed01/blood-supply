from django.db import models
from apps.bloodbanks.models import BloodBank

class Inventory(models.Model):
    BLOOD_GROUP_CHOICES = (
        ('O+', 'O+'), ('O-', 'O-'),
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    )
    inventory_id = models.IntegerField(primary_key=True)
    bloodbank = models.ForeignKey(BloodBank, on_delete=models.CASCADE, related_name='inventory_batches')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    units_available = models.PositiveIntegerField()
    units_reserved = models.PositiveIntegerField(default=0)
    expiry_date = models.DateField(db_index=True)
    last_updated = models.DateField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['bloodbank', 'blood_group']),
            models.Index(fields=['expiry_date']),
        ]

    def __str__(self):
        return f"{self.bloodbank.name} - {self.blood_group} ({self.units_available} units)"