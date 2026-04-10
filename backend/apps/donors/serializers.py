from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Donor, DonationHistory, Notification
from apps.bloodbanks.serializers import BloodBankSerializer

class DonorMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = ['donor_id', 'name', 'blood_group', 'city', 'email', 'phone', 'eligibility_status']

class DonorTokenObtainSerializer(serializers.Serializer):
    donor_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        donor_id = attrs.get('donor_id')
        password = attrs.get('password')

        try:
            donor = Donor.objects.get(donor_id=donor_id)
        except Donor.DoesNotExist:
            raise serializers.ValidationError('No active donor found with this ID')

        if not donor.check_password(password):
            raise serializers.ValidationError('Invalid password')

        if not donor.is_active:
            raise serializers.ValidationError('Donor account is inactive')

        # Manually create token
        refresh = RefreshToken()
        refresh['user_id'] = donor.donor_id      # required for token validation
        refresh['donor_id'] = donor.donor_id
        refresh['role'] = 'DONOR'
        refresh['name'] = donor.name

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'donor': DonorMinimalSerializer(donor).data
        }
        return data

class DonorDetailSerializer(serializers.ModelSerializer):
    preferred_bloodbank = BloodBankSerializer(read_only=True)
    class Meta:
        model = Donor
        fields = '__all__'

class DonationHistorySerializer(serializers.ModelSerializer):
    bloodbank_name = serializers.CharField(source='bloodbank.name', read_only=True)
    class Meta:
        model = DonationHistory
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    bloodbank_name = serializers.CharField(source='bloodbank.name', read_only=True)
    class Meta:
        model = Notification
        fields = '__all__'