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

# --- Global Variables ---
# We will store the pre-computed results here
PRECOMPUTED_CITIES = []

# --- Load Assets and Pre-compute Predictions at Startup ---
try:
    # Define paths
    MODEL_DIR = 'models'
    DATA_DIR = 'data'
    MODEL_PATH = os.path.join(MODEL_DIR, 'global_model.h5')
    SCALER_PATH = os.path.join(MODEL_DIR, 'global_scaler.pkl')
    DATA_PATH = os.path.join(DATA_DIR, 'City_Data - add major cities of west bengal , jharkhand and up.csv')

    # Load model, scaler, and data
    model = load_model(MODEL_PATH)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    df = pd.read_csv(DATA_PATH)
    df['date'] = pd.to_datetime(df['date'])
    print("Global model, scaler, and main dataset loaded successfully.")

    # --- PERFORMANCE OPTIMIZATION: Pre-computation Logic ---
    print("Pre-computing predictions for all cities...")
    
    unique_cities = df[['city', 'latitude', 'longitude']].dropna().drop_duplicates('city')

    for _, city_row in unique_cities.iterrows():
        city_name = city_row['city']
        
        # Get the last sequence for the city
        city_df = df[df['city'] == city_name].copy()
        if len(city_df) >= 4:
            city_df.sort_values('date', inplace=True)
            city_df['month'] = city_df['date'].dt.month
            city_df['year'] = city_df['date'].dt.year
            city_df['rainfall_lag_1'] = df[df['city'] == city_name]['monthly_rainfall_mm'].shift(1)
            features = ['groundwater_level_mbgl', 'monthly_rainfall_mm', 'monthly_avg_temp_c', 'estimated_population', 'month', 'year', 'rainfall_lag_1']
            city_df_processed = city_df[features]
            city_df_processed.ffill(inplace=True)
            city_df_processed.bfill(inplace=True)
            scaled_city_data = scaler.transform(city_df_processed)
            last_sequence = scaled_city_data[-4:]

            # Make prediction
            reshaped_sequence = last_sequence.reshape(1, 4, 7)
            predicted_scaled_value = model.predict(reshaped_sequence, verbose=0)
            
            dummy_array = np.zeros((1, 7))
            dummy_array[0, 0] = predicted_scaled_value
            predicted_value = scaler.inverse_transform(dummy_array)[0, 0]
            
            # Get latest population info
            latest_city_info = city_df.sort_values('date').iloc[-1]
            population = latest_city_info.get('estimated_population', 0)
            
            # Store the result
            city_data = city_row.to_dict()
            city_data['prediction'] = round(float(predicted_value), 2)
            city_data['population_millions'] = 0 if pd.isna(population) else round(population / 1_000_000, 2)
            city_data['growth_rate_pct'] = 1.5  # Placeholder
            PRECOMPUTED_CITIES.append(city_data)

    print(f"Successfully pre-computed predictions for {len(PRECOMPUTED_CITIES)} cities.")

except Exception as e:
    print(f"Error during startup and pre-computation: {e}")


# --- API Endpoint ---
@app.route('/api/all-cities-data')
def get_all_cities_data():
    """
    This endpoint is now extremely fast because it simply returns the
    pre-computed list of cities.
    """
    if not PRECOMPUTED_CITIES:
        return jsonify({"error": "City data is not available or failed to compute."}), 500
    
    return jsonify(PRECOMPUTED_CITIES)

# --- Run App ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

