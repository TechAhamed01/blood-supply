import joblib
import os
import pandas as pd
from datetime import datetime, timedelta
from django.conf import settings

class DemandPredictor:
    def __init__(self):
        self.model_path = os.path.join(settings.ML_MODELS_DIR, 'demand_model.pkl')
        self.model = None

    def load_model(self):
        if self.model is None:
            self.model = joblib.load(self.model_path)

    def predict_demand(self, hospital_id, blood_group, date):
        """
        Predict demand for a single hospital, blood group, and date.
        date: datetime.date or datetime.datetime
        """
        self.load_model()
        # Prepare input as DataFrame with same feature names
        data = {
            'hospital_id': [hospital_id],
            'blood_group': [blood_group],
            'day_of_week': [date.weekday()],
            'month': [date.month],
            'day_of_month': [date.day],
            'is_weekend': [1 if date.weekday() >= 5 else 0]
        }
        X_pred = pd.DataFrame(data)
        return self.model.predict(X_pred)[0]

    def forecast_7_days(self, hospital_id, blood_group, start_date=None):
        """
        Forecast demand for next 7 days from start_date (default today).
        Returns list of (date, predicted_units).
        """
        if start_date is None:
            start_date = datetime.now().date()
        results = []
        for i in range(7):
            date = start_date + timedelta(days=i)
            pred = self.predict_demand(hospital_id, blood_group, date)
            results.append((date, int(round(pred))))
        return results