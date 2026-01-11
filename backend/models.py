from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class SensorData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    soil_moisture = db.Column(db.Integer, nullable=False)
    light_intensity = db.Column(db.Integer, nullable=False)
    water_level = db.Column(db.Float, nullable=False)
    intrusion_count = db.Column(db.Integer, nullable=False)
    
    # ML Results
    csi = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    primary_stress_factor = db.Column(db.String(100), nullable=False)
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'soil_moisture': self.soil_moisture,
            'light_intensity': self.light_intensity,
            'water_level': self.water_level,
            'intrusion_count': self.intrusion_count,
            'csi': self.csi,
            'status': self.status,
            'primary_stress_factor': self.primary_stress_factor,
            'timestamp': self.timestamp.isoformat()
        }
