from django.db import models

class Hospital(models.Model):
    hospital_id = models.IntegerField(primary_key=True)  # from Excel
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    contact = models.CharField(max_length=20)
    capacity = models.IntegerField()
    avg_daily_surgeries = models.IntegerField()
    emergency_cases_per_day = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class HospitalInventory(models.Model):
    BLOOD_GROUP_CHOICES = (
        ('O+', 'O+'), ('O-', 'O-'),
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    )
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='inventory')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    units_available = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('hospital', 'blood_group')

    def __str__(self):
        return f"{self.hospital.name} - {self.blood_group}: {self.units_available}"