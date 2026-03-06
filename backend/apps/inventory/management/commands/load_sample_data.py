import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from datetime import datetime
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory, BLOOD_GROUP_CHOICES

User = get_user_model()

class Command(BaseCommand):
    help = 'Load sample data from Excel files into the database and create corresponding users.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--path',
            type=str,
            default='.',
            help='Path to the directory containing the Excel files (default: current directory)'
        )

    def handle(self, *args, **options):
        path = options['path']
        files = {
            'hospitals': os.path.join(path, 'Hospitals.xlsx'),
            'bloodbanks': os.path.join(path, 'BloodBanks.xlsx'),
            'inventory': os.path.join(path, 'Inventory.xlsx'),
        }

        # Check if all files exist
        for name, filepath in files.items():
            if not os.path.exists(filepath):
                self.stderr.write(self.style.ERROR(f'File not found: {filepath}'))
                return

        self.stdout.write('Starting data load...')

        # We'll use transactions to ensure consistency
        with transaction.atomic():
            self.load_hospitals(files['hospitals'])
            self.load_bloodbanks(files['bloodbanks'])
            self.load_inventory(files['inventory'])

        self.stdout.write(self.style.SUCCESS('Data loaded successfully.'))

    def load_hospitals(self, filepath):
        df = pd.read_excel(filepath)
        created_count = 0
        user_count = 0
        # Mapping original hospital_id -> Hospital instance
        self.hospital_map = {}

        for _, row in df.iterrows():
            # Check if hospital already exists (by name and city)
            hospital = Hospital.objects.filter(name=row['name'], city=row['city']).first()
            if not hospital:
                hospital = Hospital.objects.create(
                    name=row['name'],
                    city=row['city'],
                    latitude=row['latitude'],
                    longitude=row['longitude'],
                    address=row['address'],
                    contact=row['contact'],
                    capacity=row['capacity'],
                    avg_daily_surgeries=row.get('avg_daily_surgeries', 0),
                    emergency_cases_per_day=row.get('emergency_cases_per_day', 0),
                )
                created_count += 1

            # Store mapping using original hospital_id (from Excel)
            self.hospital_map[row['hospital_id']] = hospital

            # Create user for this hospital
            email = f"hospital_{row['hospital_id']}@demo.com"
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': row['name'],
                    'role': 'HOSPITAL',
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()
                user_count += 1

            # Link user to hospital if not already linked
            if not hospital.user:
                hospital.user = user
                hospital.save()

        self.stdout.write(f'{created_count} hospitals created, {user_count} hospital users created.')

    def load_bloodbanks(self, filepath):
        df = pd.read_excel(filepath)
        created_count = 0
        user_count = 0
        self.bloodbank_map = {}

        for _, row in df.iterrows():
            bloodbank = BloodBank.objects.filter(name=row['name'], city=row['city']).first()
            if not bloodbank:
                bloodbank = BloodBank.objects.create(
                    name=row['name'],
                    city=row['city'],
                    latitude=row['latitude'],
                    longitude=row['longitude'],
                    address=row['address'],
                    contact=row['contact'],
                    storage_capacity=row['storage_capacity'],
                    component_separation_available=row.get('component_separation_available', False),
                    operational_status=row.get('operational_status', 'ACTIVE'),
                )
                created_count += 1

            self.bloodbank_map[row['bloodbank_id']] = bloodbank

            email = f"bloodbank_{row['bloodbank_id']}@demo.com"
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': row['name'],
                    'role': 'BLOODBANK',
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()
                user_count += 1

            if not bloodbank.user:
                bloodbank.user = user
                bloodbank.save()

        self.stdout.write(f'{created_count} blood banks created, {user_count} blood bank users created.')

    def load_inventory(self, filepath):
        df = pd.read_excel(filepath)
        created_count = 0

        for _, row in df.iterrows():
            bloodbank = self.bloodbank_map.get(row['bloodbank_id'])
            if not bloodbank:
                self.stderr.write(self.style.WARNING(f"BloodBank with original ID {row['bloodbank_id']} not found. Skipping inventory row."))
                continue

            # Avoid exact duplicates
            _, created = Inventory.objects.get_or_create(
                bloodbank=bloodbank,
                blood_group=row['blood_group'],
                units_available=row['units_available'],
                units_reserved=row.get('units_reserved', 0),
                expiry_date=row['expiry_date'],
                defaults={
                    'last_updated': row.get('last_updated', datetime.now().date()),
                    'batch_code': row.get('batch_code', ''),
                }
            )
            if created:
                created_count += 1

        self.stdout.write(f'{created_count} inventory batches added.')