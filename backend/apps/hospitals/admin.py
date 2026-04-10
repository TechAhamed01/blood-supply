from django.contrib import admin
from .models import Hospital, HospitalInventory

# Register your models here.
admin.site.register(Hospital)
admin.site.register(HospitalInventory)
