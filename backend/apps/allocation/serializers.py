from rest_framework import serializers
from .models import AllocationRequest, AllocationItem

class AllocationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllocationItem
        fields = '__all__'

class AllocationRequestSerializer(serializers.ModelSerializer):
    items = AllocationItemSerializer(many=True, read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = AllocationRequest
        fields = '__all__'