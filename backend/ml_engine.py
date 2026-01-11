import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

MODEL_PATH = 'csi_model.pkl'

def generate_synthetic_data(n_samples=2000):
    """
    Generates synthetic data for crop stress prediction.
    Features: Temperature, Humidity, Soil Moisture, Light Intensity, Water Level, Intrusion
    Target: CSI (0-100)
    """
    np.random.seed(42)
    
    # Generate random features within realistic ranges
    temperature = np.random.uniform(20, 45, n_samples)  # Celsius
    humidity = np.random.uniform(30, 90, n_samples)     # %
    soil_moisture = np.random.randint(200, 1024, n_samples) # Analog value (higher is drier usually, but let's assume raw sensor)
    # Let's assume standard capacitive sensor: 0-1000, where higher is WETTER or invert logic. 
    # Convention: 0=Dry, 1000=Wet for simplicity in correlation, or clarify.
    # Let's stick to standard: Low number = Dry.
    
    light_intensity = np.random.randint(0, 1000, n_samples) # Lux/Analog
    water_level = np.random.uniform(0, 50, n_samples)   # cm
    intrusion = np.random.randint(0, 2, n_samples) # 0 or 1
    
    # Calculate CSI based on logic (to make it learnable)
    # Base stress
    csi = np.zeros(n_samples)
    
    # Temperature stress: Ideal 25-30. Stress increases as we deviate.
    temp_stress = np.abs(temperature - 28) * 2.5
    csi += temp_stress
    
    # Humidity stress: Ideal 50-70.
    hum_stress = np.abs(humidity - 60) * 0.5
    csi += hum_stress
    
    # Soil Moisture stress: Ideal > 500.
    # If moisture < 400, high stress.
    moisture_stress = np.maximum(0, (600 - soil_moisture) / 10)
    csi += moisture_stress
    
    # Water Level stress
    water_stress = np.maximum(0, (10 - water_level) * 2)
    csi += water_stress
    
    # Intrusion (Immediate high stress)
    csi += intrusion * 20
    
    # Add random noise
    csi += np.random.normal(0, 2, n_samples)
    
    # Clip to 0-100
    csi = np.clip(csi, 0, 100)
    
    df = pd.DataFrame({
        'temperature': temperature,
        'humidity': humidity,
        'soil_moisture': soil_moisture,
        'light_intensity': light_intensity,
        'water_level': water_level,
        'intrusion_count': intrusion,
        'csi': csi
    })
    
    return df

class MLEngine:
    def __init__(self):
        self.model = None
        self.features = ['temperature', 'humidity', 'soil_moisture', 'light_intensity', 'water_level', 'intrusion_count']

    def train(self):
        print("Generating synthetic data...")
        df = generate_synthetic_data()
        X = df[self.features]
        y = df['csi']
        
        print("Training Random Forest Regressor...")
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Save model
        joblib.dump(self.model, MODEL_PATH)
        print("Model trained and saved.")
        return self.model.score(X, y)

    def load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                print("Model loaded from disk.")
            except:
                self.train()
        else:
            self.train()

    def predict(self, data):
        """
        data: dict containing feature values
        returns: dict with csi, status, reason
        """
        if not self.model:
            self.load_or_train()
            
        # Create DataFrame for single prediction
        input_df = pd.DataFrame([data], columns=self.features)
        
        # Predict CSI
        csi_pred = self.model.predict(input_df)[0]
        
        # Determine Status
        if csi_pred < 30:
            status = 'Healthy'
        elif csi_pred < 60:
            status = 'Moderate Stress'
        else:
            status = 'High Stress'
            
        # Determine Primary Stress Factor
        # We look at feature importances for the model generally, 
        # but for individual prediction, we can look at deviation from ideal.
        # Simple heuristic for "Primary Reason" for this specific sample:
        # Check which value contributes most to the stress logic (reverse engineer slightly)
        
        reasons = []
        if data['temperature'] > 35 or data['temperature'] < 10:
            reasons.append('Temperature')
        if data['soil_moisture'] < 400:
            reasons.append('Low Soil Moisture')
        if data['water_level'] < 10:
            reasons.append('Low Water Level')
        if data['intrusion_count'] > 0:
            reasons.append('Intrusion Detected')
            
        primary_reason = reasons[0] if reasons else 'Normal Conditions'
        
        return {
            'csi': round(csi_pred, 2),
            'status': status,
            'primary_stress_factor': primary_reason
        }

# Singleton instance (optional, or just use class)
engine = MLEngine()
