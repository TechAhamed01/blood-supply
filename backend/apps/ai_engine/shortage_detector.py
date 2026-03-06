from collections import defaultdict
from hospitals.models import Hospital
from bloodbanks.models import BloodBank
from inventory.models import Inventory
from .demand_predictor import DemandPredictor
from datetime import datetime, timedelta
from django.db import models
from django.conf import settings

def detect_shortage_risks(safety_factor=1.2):
    """
    Returns list of shortage warnings per (city, blood_group).
    """
    predictor = DemandPredictor()
    blood_groups = settings.BLOOD_GROUPS
    cities = set(Hospital.objects.values_list('city', flat=True))
    risks = []

    for city in cities:
        # Hospitals in this city
        hospitals = Hospital.objects.filter(city=city)
        # Blood banks in this city
        bloodbanks = BloodBank.objects.filter(city=city)
        if not bloodbanks:
            continue

        # Aggregate current stock per blood group in this city
        stock = defaultdict(int)
        for bb in bloodbanks:
            inv_sum = Inventory.objects.filter(
                bloodbank=bb,
                expiry_date__gt=datetime.now().date()
            ).values('blood_group').annotate(total=models.Sum('units_available'))
            for item in inv_sum:
                stock[item['blood_group']] += item['total']

        # Aggregate predicted demand for next 7 days per blood group
        demand = defaultdict(int)
        start_date = datetime.now().date()
        for hospital in hospitals:
            for bg in blood_groups:  # blood_groups list from settings
                forecast = predictor.forecast_7_days(hospital.id, bg, start_date)
                for date, pred in forecast:
                    demand[bg] += pred

        # Compare
        for bg in blood_groups:
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