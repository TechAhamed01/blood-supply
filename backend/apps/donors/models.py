from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from apps.bloodbanks.models import BloodBank
import datetime

class Donor(models.Model):
    donor_id = models.CharField(max_length=10, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=3, choices=[
        ('O+', 'O+'), ('O-', 'O-'), ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-')
    ])
    city = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    password = models.CharField(max_length=128)  # hashed
    preferred_bloodbank = models.ForeignKey(BloodBank, on_delete=models.SET_NULL, null=True, blank=True)
    registration_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    last_donation_date = models.DateField(null=True, blank=True)
    next_eligible_date = models.DateField(null=True, blank=True)
    total_donations = models.IntegerField(default=0)
    total_units = models.IntegerField(default=0)
    eligibility_status = models.CharField(max_length=20, default='New Donor')

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def id(self):
        return self.donor_id

    def __str__(self):
        return f"{self.name} ({self.donor_id})"

class DonationHistory(models.Model):
    history_id = models.CharField(max_length=10, unique=True, primary_key=True)
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='donations')
    bloodbank = models.ForeignKey(BloodBank, on_delete=models.SET_NULL, null=True)
    donation_date = models.DateField()
    units = models.IntegerField(default=1)
    next_eligible_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.donor.donor_id} - {self.donation_date}"
