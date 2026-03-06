

# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory, BLOOD_GROUP_CHOICES

class AllocationRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PARTIALLY_FULFILLED', 'Partially Fulfilled'),
        ('FULFILLED', 'Fulfilled'),
        ('CANCELLED', 'Cancelled'),
    )
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='allocation_requests')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    units_requested = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    units_allocated = models.PositiveIntegerField(default=0)
    emergency_flag = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    requested_at = models.DateTimeField(auto_now_add=True)
    allocated_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Request {self.id} - {self.hospital.name} - {self.blood_group}"

class AllocationItem(models.Model):
    allocation_request = models.ForeignKey(AllocationRequest, on_delete=models.CASCADE, related_name='items')
    inventory_batch = models.ForeignKey(Inventory, on_delete=models.PROTECT)
    bloodbank = models.ForeignKey(BloodBank, on_delete=models.CASCADE)
    units_taken = models.PositiveIntegerField()
    distance_km = models.FloatField(null=True, blank=True)
    estimated_delivery_min = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alloc {self.allocation_request.id} - {self.bloodbank.name} - {self.units_taken} units"