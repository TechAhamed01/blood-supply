import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import os
from django.conf import settings
from datetime import datetime

def train_demand_model():
    # Load historical demand data (from DemandRecord model or CSV)
    # In production, we would query the DemandRecord table.
    # For now, we simulate loading from the Excel file.
    file_path = os.path.join(settings.DATASETS_DIR, "HistoricalDemand.xlsx")
    df = pd.read_excel(file_path)

    # Feature engineering
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['day_of_month'] = df['date'].dt.day
    df['is_weekend'] = df['day_of_week'].isin([5,6]).astype(int)

    # Target
    y = df['units_requested']

    # Features
    feature_cols = ['hospital_id', 'blood_group', 'day_of_week', 'month', 'day_of_month', 'is_weekend']
    X = df[feature_cols]

    # Preprocessing: one-hot encode categoricals
    categorical_features = ['hospital_id', 'blood_group']
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough'  # keep numeric features
    )

    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate (optional)
    score = model.score(X_test, y_test)
    print(f"Demand model R²: {score:.3f}")

    # Save model
    model_path = os.path.join(settings.ML_MODELS_DIR, 'demand_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

def train_delivery_model():
    # Generate synthetic dataset: distances 0–100 km, delivery time = base + distance * speed_factor + noise
    np.random.seed(42)
    n_samples = 1000
    distances = np.random.uniform(0, 100, n_samples)
    # Assume base 15 min, speed 40 km/h => minutes per km = 1.5
    true_time = 15 + distances * 1.5
    noise = np.random.normal(0, 5, n_samples)  # 5 min std dev
    times = true_time + noise

    X = distances.reshape(-1, 1)
    y = times

    from sklearn.linear_model import LinearRegression
    model = LinearRegression()
    model.fit(X, y)

    # Save model
    model_path = os.path.join(settings.ML_MODELS_DIR, 'delivery_model.pkl')
    joblib.dump(model, model_path)
    print(f"Delivery model saved. R²: {model.score(X, y):.3f}")