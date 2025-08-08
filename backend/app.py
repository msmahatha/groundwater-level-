# app.py (Final Version with Global Model - FIXED LatLng Bug)
import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

# --- Initialization ---
app = Flask(__name__)
CORS(app)

# --- Load Global Model, Scaler, and Main DataFrame ---
MODEL_DIR = 'models'
DATA_DIR = 'data'
MODEL_PATH = os.path.join(MODEL_DIR, 'global_model.h5')
SCALER_PATH = os.path.join(MODEL_DIR, 'global_scaler.pkl')
DATA_PATH = os.path.join(DATA_DIR, 'City_Data - add major cities of west bengal , jharkhand and up.csv')

try:
    model = load_model(MODEL_PATH)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    df = pd.read_csv(DATA_PATH)
    df['date'] = pd.to_datetime(df['date'])
    print("Global model, scaler, and main dataset loaded successfully.")
except Exception as e:
    model, scaler, df = None, None, None
    print(f"Error loading assets: {e}")

# --- Helper Function ---
def get_last_sequence_for_city(city_name):
    city_df = df[df['city'] == city_name].copy()
    if len(city_df) < 4:
        return None

    city_df.sort_values('date', inplace=True)
    city_df['month'] = city_df['date'].dt.month
    city_df['year'] = city_df['date'].dt.year
    city_df['rainfall_lag_1'] = df[df['city'] == city_name]['monthly_rainfall_mm'].shift(1)

    features = [
        'groundwater_level_mbgl', 'monthly_rainfall_mm', 'monthly_avg_temp_c',
        'estimated_population', 'month', 'year', 'rainfall_lag_1'
    ]
    city_df = city_df[features]
    city_df.ffill(inplace=True)
    city_df.bfill(inplace=True)

    scaled_city_data = scaler.transform(city_df)
    return scaled_city_data[-4:]

# --- API Endpoint ---
@app.route('/api/all-cities-data')
def get_all_cities_data():
    if df is None or model is None or scaler is None:
        return jsonify({"error": "Model or data not loaded"}), 500

    cities_with_predictions = []

    # Filter out rows with missing lat/lng and get unique cities
    unique_cities = df[['city', 'latitude', 'longitude', 'estimated_population']]
    unique_cities = unique_cities.dropna(subset=['latitude', 'longitude']).drop_duplicates('city')

    for _, city in unique_cities.iterrows():
        city_name = city['city']
        lat, lng = city['latitude'], city['longitude']

        if pd.isna(lat) or pd.isna(lng):
            print(f"Skipping {city_name} due to missing coordinates.")
            continue

        last_sequence = get_last_sequence_for_city(city_name)
        if last_sequence is None:
            continue

        reshaped_sequence = last_sequence.reshape(1, 4, 7)
        predicted_scaled_value = model.predict(reshaped_sequence, verbose=0)

        dummy_array = np.zeros((1, 7))
        dummy_array[0, 0] = predicted_scaled_value
        predicted_value = scaler.inverse_transform(dummy_array)[0, 0]

        city_data = city.to_dict()
        city_data['prediction'] = round(float(predicted_value), 2)
        city_data['population_millions'] = round(city_data['estimated_population'] / 1_000_000, 2)
        city_data['growth_rate_pct'] = 1.5  # Placeholder

        # Ensure lat/lng are floats (for frontend safety)
        city_data['latitude'] = float(city_data['latitude'])
        city_data['longitude'] = float(city_data['longitude'])

        cities_with_predictions.append(city_data)

    return jsonify(cities_with_predictions)

# --- Run App ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

