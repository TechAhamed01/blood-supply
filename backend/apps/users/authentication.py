from django.contrib.auth.backends import BaseBackend
from .models import User

class NameContactBackend(BaseBackend):
    """
    Authenticate using username (name) and password (contact).
    This backend allows users to log in with their hospital/bloodbank name as username
    and their contact number as password.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to find the user by username (which is the hospital/bloodbank name)
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return None
        
        # Check if the password matches (password is the contact number, stored hashed)
        if user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None