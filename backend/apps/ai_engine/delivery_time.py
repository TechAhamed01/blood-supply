import joblib
import os
from django.conf import settings
from .utils import haversine

class DeliveryTimeEstimator:
    def __init__(self):
        self.model_path = os.path.join(settings.ML_MODELS_DIR, 'delivery_model.pkl')
        self.model = None

    def load_model(self):
        if self.model is None:
            self.model = joblib.load(self.model_path)

    def estimate(self, bloodbank_lat, bloodbank_lon, hospital_lat, hospital_lon):
        distance = haversine(bloodbank_lat, bloodbank_lon, hospital_lat, hospital_lon)
        self.load_model()
        pred = self.model.predict([[distance]])
        return max(0, int(round(pred[0])))