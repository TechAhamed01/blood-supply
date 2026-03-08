from rest_framework import serializers
from .models import AllocationRequest, AllocationItem
from apps.bloodbanks.models import BloodBank

class AllocationItemSerializer(serializers.ModelSerializer):
    bloodbank_name = serializers.CharField(source='bloodbank.name', read_only=True)
    bloodbank_id = serializers.IntegerField(source='bloodbank.bloodbank_id', read_only=True)
    
    class Meta:
        model = AllocationItem
        fields = [
            'id', 
            'bloodbank_id', 
            'bloodbank_name',  # Add this field
            'units_taken', 
            'distance_km', 
            'estimated_delivery_min'
        ]

class AllocationRequestSerializer(serializers.ModelSerializer):
    items = AllocationItemSerializer(many=True, read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    hospital_id = serializers.IntegerField(source='hospital.hospital_id', read_only=True)

    class Meta:
        model = AllocationRequest
        fields = [
            'id',
            'hospital_id',
            'hospital_name',
            'blood_group',
            'units_requested',
            'units_allocated',
            'status',
            'emergency_flag',
            'requested_at',
            'allocated_at',
            'notes',
            'items'
        ]