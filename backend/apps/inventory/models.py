

# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator
from apps.bloodbanks.models import BloodBank

BLOOD_GROUP_CHOICES = (
    ('A+', 'A+'), ('A-', 'A-'),
    ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'),
    ('O+', 'O+'), ('O-', 'O-'),
)

class Inventory(models.Model):
    bloodbank = models.ForeignKey(BloodBank, on_delete=models.CASCADE, related_name='inventory_batches')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, db_index=True)
    units_available = models.PositiveIntegerField(validators=[MinValueValidator(0)], default=0)
    units_reserved = models.PositiveIntegerField(validators=[MinValueValidator(0)], default=0)
    expiry_date = models.DateField(db_index=True)
    last_updated = models.DateField(auto_now=True)
    batch_code = models.CharField(max_length=50, blank=True, help_text="Optional batch identifier")

    class Meta:
        indexes = [
            models.Index(fields=['bloodbank', 'blood_group']),
        ]

    def __str__(self):
        return f"{self.bloodbank.name} - {self.blood_group} ({self.units_available} avail)"