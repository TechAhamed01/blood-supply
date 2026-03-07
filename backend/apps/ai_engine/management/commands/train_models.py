import pandas as pd
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.ai_engine.model_trainer import train_demand_model, train_delivery_model

class Command(BaseCommand):
    help = 'Train ML models using HistoricalDemand.xlsx and save to media folder.'

    def add_arguments(self, parser):
        parser.add_argument('--demand-file', type=str, default='HistoricalDemand.xlsx',
                            help='Path to HistoricalDemand Excel file')

    def handle(self, *args, **options):
        demand_file = options['demand_file']
        if not os.path.exists(demand_file):
            self.stderr.write(f"File {demand_file} not found.")
            return

        self.stdout.write("Training demand prediction model...")
        train_demand_model(demand_file)
        self.stdout.write("Training delivery time estimation model...")
        train_delivery_model()
        self.stdout.write("All models trained successfully.")