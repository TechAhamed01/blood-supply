from collections import defaultdict
from datetime import datetime, timedelta
from django.db.models import Sum
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory
from .demand_predictor import DemandPredictor

BLOOD_GROUPS = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-']

def detect_shortage_risks(safety_factor=1.2):
    predictor = DemandPredictor()
    cities = set(Hospital.objects.values_list('city', flat=True))
    risks = []

    for city in cities:
        hospitals = Hospital.objects.filter(city=city)
        bloodbanks = BloodBank.objects.filter(city=city)
        if not bloodbanks:
            continue

        stock = defaultdict(int)
        for bb in bloodbanks:
            inv_sum = Inventory.objects.filter(
                bloodbank=bb,
                expiry_date__gt=datetime.now().date()
            ).values('blood_group').annotate(total=Sum('units_available'))
            for item in inv_sum:
                stock[item['blood_group']] += item['total']

        demand = defaultdict(int)
        start_date = datetime.now().date()
        for hospital in hospitals:
            for bg in BLOOD_GROUPS:
                forecast = predictor.forecast_7_days(hospital.hospital_id, bg, start_date)
                for date, pred in forecast:
                    demand[bg] += pred

        for bg in BLOOD_GROUPS:
            if bg in stock and bg in demand:
                if stock[bg] < demand[bg] * safety_factor:
                    risks.append({
                        'city': city,
                        'blood_group': bg,
                        'current_stock': stock[bg],
                        'predicted_7day_demand': demand[bg],
                        'risk_level': 'HIGH' if stock[bg] < demand[bg] else 'MEDIUM'
                    })
            elif bg not in stock and bg in demand:
                risks.append({
                    'city': city,
                    'blood_group': bg,
                    'current_stock': 0,
                    'predicted_7day_demand': demand[bg],
                    'risk_level': 'CRITICAL'
                })
    return risks