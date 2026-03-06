from rest_framework import serializers
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory

class DemandForecastInputSerializer(serializers.Serializer):
    hospital_id = serializers.IntegerField()
    blood_group = serializers.ChoiceField(choices=[
        ('O+', 'O+'), ('O-', 'O-'), ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-')
    ])
    start_date = serializers.DateField(required=False, help_text="Start date for 7-day forecast (default today)")

    def validate_hospital_id(self, value):
        if not Hospital.objects.filter(id=value).exists():
            raise serializers.ValidationError("Hospital does not exist.")
        return value

class DemandForecastOutputSerializer(serializers.Serializer):
    date = serializers.DateField()
    predicted_units = serializers.IntegerField()

class AllocationInputSerializer(serializers.Serializer):
    hospital_id = serializers.IntegerField()
    blood_group = serializers.ChoiceField(choices=[
        ('O+', 'O+'), ('O-', 'O-'), ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-')
    ])
    units_requested = serializers.IntegerField(min_value=1)
    emergency_flag = serializers.BooleanField(default=False)

    def validate_hospital_id(self, value):
        if not Hospital.objects.filter(id=value).exists():
            raise serializers.ValidationError("Hospital does not exist.")
        return value

class AllocationOutputSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['FULFILLED', 'PARTIAL', 'UNAVAILABLE'])
    message = serializers.CharField()
    allocations = serializers.ListField(
        child=serializers.DictField()  # detailed breakdown
    )

class DeliveryTimeInputSerializer(serializers.Serializer):
    bloodbank_id = serializers.IntegerField(required=False)
    hospital_id = serializers.IntegerField(required=False)
    bloodbank_lat = serializers.FloatField(required=False)
    bloodbank_lon = serializers.FloatField(required=False)
    hospital_lat = serializers.FloatField(required=False)
    hospital_lon = serializers.FloatField(required=False)

    def validate(self, data):
        # Either (bloodbank_id, hospital_id) or explicit coordinates must be provided
        if 'bloodbank_id' in data and 'hospital_id' in data:
            # Validate existence
            if not BloodBank.objects.filter(id=data['bloodbank_id']).exists():
                raise serializers.ValidationError({"bloodbank_id": "Blood bank does not exist."})
            if not Hospital.objects.filter(id=data['hospital_id']).exists():
                raise serializers.ValidationError({"hospital_id": "Hospital does not exist."})
        elif 'bloodbank_lat' in data and 'bloodbank_lon' in data and 'hospital_lat' in data and 'hospital_lon' in data:
            # coordinates present
            pass
        else:
            raise serializers.ValidationError("Provide either (bloodbank_id, hospital_id) or all four coordinates.")
        return data

class DeliveryTimeOutputSerializer(serializers.Serializer):
    estimated_time_minutes = serializers.IntegerField()
    distance_km = serializers.FloatField(required=False)

class ShortageRiskOutputSerializer(serializers.Serializer):
    city = serializers.CharField()
    blood_group = serializers.CharField()
    current_stock = serializers.IntegerField()
    predicted_7day_demand = serializers.IntegerField()
    risk_level = serializers.CharField()