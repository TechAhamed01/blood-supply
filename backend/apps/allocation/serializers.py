from rest_framework import serializers
from .models import AllocationRequest, AllocationItem
from apps.hospitals.serializers import HospitalSerializer
from apps.bloodbanks.serializers import BloodBankSerializer

class AllocationItemSerializer(serializers.ModelSerializer):
    bloodbank_name = serializers.CharField(source='bloodbank.name', read_only=True)
    inventory_batch_id = serializers.IntegerField(source='inventory_batch.id', read_only=True)

    class Meta:
        model = AllocationItem
        fields = ('id', 'bloodbank', 'bloodbank_name', 'inventory_batch', 'inventory_batch_id',
                  'units_taken', 'distance_km', 'estimated_delivery_min', 'created_at')
        read_only_fields = ('id', 'created_at')

class AllocationRequestSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    items = AllocationItemSerializer(many=True, read_only=True)

    class Meta:
        model = AllocationRequest
        fields = ('id', 'hospital', 'hospital_name', 'blood_group', 'units_requested',
                  'units_allocated', 'emergency_flag', 'status', 'requested_at',
                  'allocated_at', 'notes', 'items')
        read_only_fields = ('id', 'requested_at', 'allocated_at', 'units_allocated', 'status', 'items')