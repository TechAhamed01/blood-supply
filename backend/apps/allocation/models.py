from django.db import models
from apps.hospitals.models import Hospital
from apps.inventory.models import Inventory

class AllocationRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PARTIALLY_FULFILLED', 'Partially Fulfilled'),
        ('FULFILLED', 'Fulfilled'),
        ('CANCELLED', 'Cancelled'),
    )
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='allocation_requests')
    blood_group = models.CharField(max_length=3, choices=Inventory.BLOOD_GROUP_CHOICES)
    units_requested = models.PositiveIntegerField()
    units_allocated = models.PositiveIntegerField(default=0)
    emergency_flag = models.BooleanField(default=False)
    is_emergency_broadcast = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    requested_at = models.DateTimeField(auto_now_add=True)
    allocated_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

class AllocationItem(models.Model):
    allocation_request = models.ForeignKey(AllocationRequest, on_delete=models.CASCADE, related_name='items')
    inventory_batch = models.ForeignKey(Inventory, on_delete=models.PROTECT)
    units_taken = models.PositiveIntegerField()
    bloodbank = models.ForeignKey('bloodbanks.BloodBank', on_delete=models.CASCADE)  # denormalized for quick access
    distance_km = models.FloatField()
    estimated_delivery_min = models.IntegerField()