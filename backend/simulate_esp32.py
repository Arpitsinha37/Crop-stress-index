import requests
import time
import random
import json

API_URL = "http://localhost:5000/api/sensor-data"

def generate_data():
    return {
        "temperature": round(random.uniform(20, 35), 1),
        "humidity": round(random.uniform(40, 90), 1),
        "soil_moisture": random.randint(300, 800),
        "light_intensity": random.randint(500, 1000),
        "water_level": round(random.uniform(5, 15), 1),
        "intrusion_count": 0 if random.random() > 0.1 else 1
    }

print("Starting ESP32 Simulation...")
print(f"Target: {API_URL}")

while True:
    data = generate_data()
    try:
        resp = requests.post(API_URL, json=data)
        print(f"Sent Data ({resp.status_code}): CSI Predicted")
    except Exception as e:
        print(f"Connection Error: {e}")
    time.sleep(2)
