from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        
        # Fix: Use hospital_id instead of id (since hospital_id is the primary key)
        if user.hospital:
            token['hospital_id'] = user.hospital.hospital_id  # Changed from .id to .hospital_id
            
        # Fix: Use bloodbank_id instead of id
        if user.bloodbank:
            token['bloodbank_id'] = user.bloodbank.bloodbank_id  # Changed from .id to .bloodbank_id
            
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'contact', 'hospital', 'bloodbank')