from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import Donor

class DonorJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            donor_id = validated_token.get('donor_id')
            if donor_id is None:
                raise InvalidToken('Token contains no donor_id')
            donor = Donor.objects.get(donor_id=donor_id)
            return donor
        except Donor.DoesNotExist:
            raise InvalidToken('Donor not found')