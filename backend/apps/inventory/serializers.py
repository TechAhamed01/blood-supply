from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    bloodbank_name = serializers.CharField(source='bloodbank.name', read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'