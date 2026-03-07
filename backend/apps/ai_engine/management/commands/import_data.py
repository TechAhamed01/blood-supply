import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory
from apps.users.models import User

class Command(BaseCommand):
    help = 'Import data from Excel files and create users'

    def add_arguments(self, parser):
        parser.add_argument('--hospitals', type=str, default='Hospitals.xlsx')
        parser.add_argument('--bloodbanks', type=str, default='BloodBanks.xlsx')
        parser.add_argument('--inventory', type=str, default='Inventory.xlsx')
        parser.add_argument('--flush', action='store_true', help='Clear existing data')

    def handle(self, *args, **options):
        if options['flush']:
            self.stdout.write('Flushing existing data...')
            User.objects.all().delete()
            Hospital.objects.all().delete()
            BloodBank.objects.all().delete()
            Inventory.objects.all().delete()

        # Import Hospitals
        df_hosp = pd.read_excel(options['hospitals'])
        for _, row in df_hosp.iterrows():
            hosp, created = Hospital.objects.update_or_create(
                hospital_id=row['hospital_id'],
                defaults={
                    'name': row['name'],
                    'city': row['city'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'address': row['address'],
                    'contact': row['contact'],
                    'capacity': row['capacity'],
                    'avg_daily_surgeries': row['avg_daily_surgeries'],
                    'emergency_cases_per_day': row['emergency_cases_per_day'],
                }
            )
            # Create user for hospital
            user, user_created = User.objects.get_or_create(
                username=row['name'],
                defaults={
                    'role': 'HOSPITAL',
                    'contact': row['contact'],
                    'hospital': hosp,
                }
            )
            if user_created:
                user.set_password(row['contact'])
                user.save()
        self.stdout.write(f"Imported {len(df_hosp)} hospitals.")

        # Import BloodBanks
        df_bb = pd.read_excel(options['bloodbanks'])
        for _, row in df_bb.iterrows():
            bb, created = BloodBank.objects.update_or_create(
                bloodbank_id=row['bloodbank_id'],
                defaults={
                    'name': row['name'],
                    'city': row['city'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'address': row['address'],
                    'contact': row['contact'],
                    'storage_capacity': row['storage_capacity'],
                    'component_separation_available': row['component_separation_available'],
                    'operational_status': row['operational_status'],
                }
            )
            user, user_created = User.objects.get_or_create(
                username=row['name'],
                defaults={
                    'role': 'BLOODBANK',
                    'contact': row['contact'],
                    'bloodbank': bb,
                }
            )
            if user_created:
                user.set_password(row['contact'])
                user.save()
        self.stdout.write(f"Imported {len(df_bb)} blood banks.")

        # Import Inventory
        df_inv = pd.read_excel(options['inventory'])
        for _, row in df_inv.iterrows():
            try:
                bb = BloodBank.objects.get(bloodbank_id=row['bloodbank_id'])
            except BloodBank.DoesNotExist:
                self.stderr.write(f"BloodBank {row['bloodbank_id']} not found for inventory {row['inventory_id']}")
                continue
            Inventory.objects.update_or_create(
                inventory_id=row['inventory_id'],
                defaults={
                    'bloodbank': bb,
                    'blood_group': row['blood_group'],
                    'units_available': row['units_available'],
                    'units_reserved': row['units_reserved'],
                    'expiry_date': row['expiry_date'],
                    'last_updated': row['last_updated'],
                }
            )
        self.stdout.write(f"Imported {len(df_inv)} inventory batches.")