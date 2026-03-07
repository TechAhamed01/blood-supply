from django.db.models import Sum, Q
from datetime import datetime
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory
from .utils import haversine
from .delivery_time import DeliveryTimeEstimator

def smart_allocate(hospital, blood_group, units_requested, emergency=False):
    bloodbanks = BloodBank.objects.all()
    bb_with_stock = []
    for bb in bloodbanks:
        total_avail = Inventory.objects.filter(
            bloodbank=bb,
            blood_group=blood_group,
            expiry_date__gt=datetime.now().date(),
            units_available__gt=0
        ).aggregate(total=Sum('units_available'))['total']
        if total_avail and total_avail > 0:
            distance = haversine(
                hospital.latitude, hospital.longitude,
                bb.latitude, bb.longitude
            )
            bb_with_stock.append({
                'bloodbank': bb,
                'total_avail': total_avail,
                'distance': distance
            })

    if not bb_with_stock:
        return [], 'UNAVAILABLE', 'No blood bank has the required blood group.'

    bb_with_stock.sort(key=lambda x: x['distance'])
    allocations = []
    units_needed = units_requested
    dt_estimator = DeliveryTimeEstimator()

    for item in bb_with_stock:
        bb = item['bloodbank']
        batches = Inventory.objects.filter(
            bloodbank=bb,
            blood_group=blood_group,
            expiry_date__gt=datetime.now().date(),
            units_available__gt=0
        ).order_by('expiry_date')

        for batch in batches:
            if units_needed <= 0:
                break
            take = min(batch.units_available, units_needed)
            allocations.append({
                'bloodbank_id': bb.bloodbank_id,
                'bloodbank_name': bb.name,
                'inventory_id': batch.inventory_id,
                'units_taken': take,
                'distance_km': round(item['distance'], 2),
                'estimated_delivery_min': dt_estimator.estimate(
                    bb.latitude, bb.longitude,
                    hospital.latitude, hospital.longitude
                )
            })
            units_needed -= take

        if units_needed <= 0:
            break

    if units_needed == 0:
        status = 'FULFILLED'
        message = 'Request fully allocated.'
    else:
        status = 'PARTIAL'
        message = f'Only {units_requested - units_needed} of {units_requested} units allocated.'

    return allocations, status, message