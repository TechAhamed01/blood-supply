import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.donors.models import Donor, DonationHistory
from apps.bloodbanks.models import BloodBank

class Command(BaseCommand):
    help = 'Import donors and donation history from Excel'

    def handle(self, *args, **options):
        # 1. Import Donors
        df_donors = pd.read_excel('Donors.xlsx')
        
        # FIX: Remove duplicate emails from the Excel data before importing
        # This keeps the FIRST occurrence and removes others.
        initial_count = len(df_donors)
        df_donors = df_donors.drop_duplicates(subset=['email'], keep='first')
        final_count = len(df_donors)
        
        if initial_count > final_count:
            self.stdout.write(self.style.WARNING(f"Removed {initial_count - final_count} duplicate emails from Excel data."))

        for _, row in df_donors.iterrows():
            preferred_bank = None
            if pd.notna(row['preferred_bloodbank_id']):
                try:
                    preferred_bank = BloodBank.objects.get(bloodbank_id=int(row['preferred_bloodbank_id']))
                except BloodBank.DoesNotExist:
                    pass

            # Lookup by email to ensure we update if they already exist in the DB
            Donor.objects.update_or_create(
                email=row['email'],
                defaults={
                    'donor_id': row['donor_id'],
                    'name': row['name'],
                    'blood_group': row['blood_group'],
                    'city': row['city'],
                    'phone': row['phone'],
                    'password': make_password(str(row['password'])),
                    'preferred_bloodbank': preferred_bank,
                    'registration_date': row['registration_date'],
                    'is_active': row['is_active'],
                    'last_donation_date': row['last_donation_date'] if pd.notna(row['last_donation_date']) else None,
                    'next_eligible_date': row['next_eligible_date'] if pd.notna(row['next_eligible_date']) else None,
                    'total_donations': row['total_donations'],
                    'total_units': row['total_units'],
                    'eligibility_status': row['eligibility_status'],
                }
            )
        self.stdout.write(self.style.SUCCESS(f'Successfully processed {final_count} donors'))

        # 2. Import Donation History
        df_history = pd.read_excel('DonationHistory.xlsx')
        for _, row in df_history.iterrows():
            try:
                donor = Donor.objects.get(donor_id=row['donor_id'])
                bloodbank = None
                if pd.notna(row['bloodbank_id']):
                    try:
                        bloodbank = BloodBank.objects.get(bloodbank_id=int(row['bloodbank_id']))
                    except BloodBank.DoesNotExist:
                        pass
                
                DonationHistory.objects.update_or_create(
                    history_id=row['history_id'],
                    defaults={
                        'donor': donor,
                        'bloodbank': bloodbank,
                        'donation_date': row['donation_date'],
                        'units': row['units'],
                        'next_eligible_date': row['next_eligible_date'] if pd.notna(row['next_eligible_date']) else None,
                    }
                )
            except Donor.DoesNotExist:
                continue # Skip if donor was a duplicate removed in the first step

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(df_history)} history records'))