from django.db import models

class BloodBank(models.Model):
    bloodbank_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    contact = models.CharField(max_length=20)
    storage_capacity = models.IntegerField()
    component_separation_available = models.BooleanField()
    operational_status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Maintenance', 'Maintenance')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name