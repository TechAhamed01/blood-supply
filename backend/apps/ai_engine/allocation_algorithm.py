from django.db import transaction
from apps.inventory.models import Inventory
from apps.bloodbanks.models import BloodBank
from .utils import haversine
from .delivery_time import DeliveryTimeEstimator
from django.db import models
from datetime import datetime

def smart_allocate(hospital, blood_group, units_requested, emergency=False):
    """
    hospital: Hospital instance
    blood_group: string
    units_requested: int
    emergency: bool

    Returns: (allocations, status, message)
    allocations: list of dicts with bloodbank_id, batch_id, units_taken
    status: 'FULLFILLED', 'PARTIAL', 'UNAVAILABLE'
    """
    # Find all blood banks with available units of this blood group
    # Annotate with distance
    bloodbanks = BloodBank.objects.all()
    bb_with_stock = []
    for bb in bloodbanks:
        # Total available units in this blood bank for the group
        total_avail = Inventory.objects.filter(
            bloodbank=bb,
            blood_group=blood_group,
            expiry_date__gt=datetime.now().date(),
            units_available__gt=0
        ).aggregate(total=models.Sum('units_available'))['total']
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

    # Sort by distance (closest first)
    bb_with_stock.sort(key=lambda x: x['distance'])

    # For emergency, we might also sort by stock if distance is similar, but keep simple.
    allocations = []
    units_needed = units_requested
    dt_estimator = DeliveryTimeEstimator()

    for item in bb_with_stock:
        bb = item['bloodbank']
        # Get batches for this blood group, not expired, available, sorted by expiry
        batches = Inventory.objects.filter(
            bloodbank=bb,
            blood_group=blood_group,
            expiry_date__gt=datetime.now().date(),
            units_available__gt=0
        ).order_by('expiry_date')  # FEFO

        for batch in batches:
            if units_needed <= 0:
                break
            take = min(batch.units_available, units_needed)
            allocations.append({
                'bloodbank_id': bb.id,
                'bloodbank_name': bb.name,
                'inventory_id': batch.id,
                'units_taken': take,
                'distance_km': round(item['distance'], 2),
                'estimated_delivery_min': dt_estimator.estimate(
                    bb.latitude, bb.longitude,
                    hospital.latitude, hospital.longitude
                )
            })
            units_needed -= take
            # In real implementation, we'd reserve units here, but we'll update inventory later.

        if units_needed <= 0:
            break

    if units_needed == 0:
        status = 'FULFILLED'
        message = 'Request fully allocated.'
    else:
        status = 'PARTIAL'
        message = f'Only {units_requested - units_needed} of {units_requested} units allocated.'

    return allocations, status, message