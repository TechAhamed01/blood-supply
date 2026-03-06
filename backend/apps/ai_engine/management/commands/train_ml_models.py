from django.core.management.base import BaseCommand
from apps.ai_engine.model_trainer import train_demand_model, train_delivery_model
class Command(BaseCommand):
    help = 'Train all ML models and save them to media folder.'

    def handle(self, *args, **options):
        self.stdout.write('Training demand prediction model...')
        train_demand_model()
        self.stdout.write('Training delivery time estimation model...')
        train_delivery_model()
        self.stdout.write('All models trained successfully.')