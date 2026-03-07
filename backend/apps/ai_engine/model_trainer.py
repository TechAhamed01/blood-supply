import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from django.conf import settings

def train_demand_model(excel_path):
    df = pd.read_excel(excel_path)
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['day_of_month'] = df['date'].dt.day
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)

    y = df['units_requested']
    feature_cols = ['hospital_id', 'blood_group', 'day_of_week', 'month', 'day_of_month', 'is_weekend']
    X = df[feature_cols]

    categorical_features = ['hospital_id', 'blood_group']
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    preprocessor = ColumnTransformer(
        transformers=[('cat', categorical_transformer, categorical_features)],
        remainder='passthrough'
    )
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"Demand model R²: {score:.3f}")

    model_path = os.path.join(settings.ML_MODELS_DIR, 'demand_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

def train_delivery_model():
    np.random.seed(42)
    n_samples = 1000
    distances = np.random.uniform(0, 100, n_samples)
    true_time = 15 + distances * 1.5
    noise = np.random.normal(0, 5, n_samples)
    times = true_time + noise

    X = distances.reshape(-1, 1)
    y = times

    model = LinearRegression()
    model.fit(X, y)

    model_path = os.path.join(settings.ML_MODELS_DIR, 'delivery_model.pkl')
    joblib.dump(model, model_path)
    print(f"Delivery model saved. R²: {model.score(X, y):.3f}")