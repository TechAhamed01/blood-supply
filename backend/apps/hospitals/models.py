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