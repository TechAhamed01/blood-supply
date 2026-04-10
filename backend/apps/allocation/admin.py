from django.contrib import admin
from .models import AllocationRequest, AllocationItem

admin.site.register(AllocationRequest)
admin.site.register(AllocationItem)
