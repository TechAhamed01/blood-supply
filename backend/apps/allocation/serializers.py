from rest_framework import serializers
from .models import AllocationRequest, AllocationItem
from apps.bloodbanks.models import BloodBank

class AssignedBankSerializer(serializers.Serializer):
    """Serializer for banks assigned to fulfill the request"""
    bloodbank_id = serializers.IntegerField()
    bloodbank_name = serializers.CharField()
    city = serializers.CharField()
    distance_km = serializers.FloatField()
    available_units = serializers.IntegerField()
    estimated_delivery_min = serializers.IntegerField()
    contact = serializers.CharField()
    can_fulfill = serializers.BooleanField()
    priority = serializers.SerializerMethodField()
    
    def get_priority(self, obj):
        """Determine priority based on distance and stock"""
        if obj.get('priority'):
            return obj['priority']
        if obj['distance_km'] < 10:
            return 'primary'
        elif obj['distance_km'] < 25:
            return 'secondary'
        else:
            return 'backup'

class AllocationItemSerializer(serializers.ModelSerializer):
    bloodbank_name = serializers.CharField(source='bloodbank.name', read_only=True)
    bloodbank_id = serializers.IntegerField(source='bloodbank.bloodbank_id', read_only=True)
    
    class Meta:
        model = AllocationItem
        fields = [
            'id', 'bloodbank_id', 'bloodbank_name', 'units_taken', 
            'distance_km', 'estimated_delivery_min'
        ]

class AllocationRequestSerializer(serializers.ModelSerializer):
    items = AllocationItemSerializer(many=True, read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    hospital_id = serializers.IntegerField(source='hospital.hospital_id', read_only=True)
    assigned_banks = serializers.SerializerMethodField()
    
    class Meta:
        model = AllocationRequest
        fields = [
            'id', 'hospital_id', 'hospital_name', 'blood_group',
            'units_requested', 'units_allocated', 'status',
            'emergency_flag', 'is_emergency_broadcast', 'requested_at', 'allocated_at',
            'notes', 'items', 'assigned_banks'
        ]
    
    def get_assigned_banks(self, obj):
        """Get the nearest banks that were considered for this request"""
        from apps.ai_engine.allocation_algorithm import get_nearest_bloodbanks_with_details
        
        # Only show for pending or fulfilled requests
        if obj.status in ['PENDING', 'PARTIALLY_FULFILLED', 'FULFILLED']:
            banks = get_nearest_bloodbanks_with_details(
                obj.hospital,
                obj.blood_group,
                obj.units_requested - obj.units_allocated,
                limit=3
            )
            
            # Add priority information
            for i, bank in enumerate(banks):
                if i == 0:
                    bank['priority'] = 'primary'
                elif i == 1:
                    bank['priority'] = 'secondary'
                else:
                    bank['priority'] = 'backup'
            
            return AssignedBankSerializer(banks, many=True).data
        return []