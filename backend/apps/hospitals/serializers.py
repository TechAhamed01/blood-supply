from rest_framework import serializers
from .models import Hospital, HospitalInventory

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class HospitalInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalInventory
        fields = ['id', 'blood_group', 'units_available', 'last_updated']
        read_only_fields = ['id', 'last_updated']