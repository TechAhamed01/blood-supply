# apps/ai_engine/allocation_algorithm.py

from datetime import datetime
from django.db.models import Sum, Q
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory
from .utils import haversine
from .delivery_time import DeliveryTimeEstimator

# ============== NEW PROXIMITY FUNCTIONS ==============

def get_nearby_bloodbanks_for_request(hospital, blood_group, units_needed, max_results=3):
    """
    Find the nearest blood banks with sufficient stock for a specific request
    Returns list of bloodbank objects with distance
    """
    # Get all active blood banks
    bloodbanks = BloodBank.objects.filter(
        operational_status='Active'
    )
    
    banks_with_stock = []
    hospital_lat = float(hospital.latitude)
    hospital_lon = float(hospital.longitude)
    
    for bb in bloodbanks:
        # Check if this blood bank has any available units of the requested blood group
        total_avail = Inventory.objects.filter(
            bloodbank=bb,
            blood_group=blood_group,
            expiry_date__gt=datetime.now().date(),
            units_available__gt=0
        ).aggregate(total=Sum('units_available'))['total'] or 0
        
        if total_avail > 0:
            # Calculate distance
            distance = haversine(
                hospital_lat, hospital_lon,
                float(bb.latitude), float(bb.longitude)
            )
            banks_with_stock.append({
                'bloodbank': bb,
                'bloodbank_id': bb.bloodbank_id,
                'distance': round(distance, 2),
                'available': total_avail,
                'name': bb.name
            })
    
    # Sort by distance and return top N
    banks_with_stock.sort(key=lambda x: x['distance'])
    return banks_with_stock[:max_results]

def is_bloodbank_near_request(bloodbank_id, hospital, blood_group, units_needed):
    """
    Check if a specific blood bank is among the top 3 nearest for this request
    """
    nearby_banks = get_nearby_bloodbanks_for_request(hospital, blood_group, units_needed, max_results=3)
    nearby_ids = [bank['bloodbank_id'] for bank in nearby_banks]
    return bloodbank_id in nearby_ids


# ============== ORIGINAL SMART ALLOCATE FUNCTION (KEEP THIS) ==============

def smart_allocate(hospital, blood_group, units_requested, emergency=False, current_bloodbank=None):
    """
    Original smart allocation function - kept for compatibility with FulfillAllocationView
    """
    if current_bloodbank:
        # Only use the current blood bank's inventory
        bloodbanks = [current_bloodbank]
    else:
        # For other uses, use all banks
        bloodbanks = BloodBank.objects.filter(operational_status='Active')
    
    bb_with_stock = []
    hospital_lat = float(hospital.latitude)
    hospital_lon = float(hospital.longitude)
    
    for bb in bloodbanks:
        total_avail = Inventory.objects.filter(
            bloodbank=bb,
            blood_group=blood_group,
            expiry_date__gt=datetime.now().date(),
            units_available__gt=0
        ).aggregate(total=Sum('units_available'))['total']
        
        if total_avail and total_avail > 0:
            distance = haversine(
                hospital_lat, hospital_lon,
                float(bb.latitude), float(bb.longitude)
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
                    float(bb.latitude), float(bb.longitude),
                    hospital_lat, hospital_lon
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