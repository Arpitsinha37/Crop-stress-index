from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from models import db, User, SensorData
from ml_engine import engine
from functools import wraps

# Blueprint
api = Blueprint('api', __name__)

SECRET_KEY = 'hackathon-secret-key' # In prod, use env var

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@api.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing data'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    new_user = User(email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Registered successfully'}), 201

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing data'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({'token': token})

@api.route('/api/sensor-data', methods=['POST'])
def receive_sensor_data():
    data = request.get_json()
    # Expect: temperature, humidity, soil_moisture, light_intensity, water_level, intrusion_count
    # Optional: timestamp
    
    required = ['temperature', 'humidity', 'soil_moisture', 'light_intensity', 'water_level', 'intrusion_count']
    if not all(k in data for k in required):
        return jsonify({'message': 'Missing sensor data'}), 400
        
    # Run ML Prediction
    prediction = engine.predict(data)
    
    # Save to DB
    new_reading = SensorData(
        temperature=data['temperature'],
        humidity=data['humidity'],
        soil_moisture=data['soil_moisture'],
        light_intensity=data['light_intensity'],
        water_level=data['water_level'],
        intrusion_count=data['intrusion_count'],
        csi=prediction['csi'],
        status=prediction['status'],
        primary_stress_factor=prediction['primary_stress_factor']
    )
    
    db.session.add(new_reading)
    db.session.commit()
    
    return jsonify({
        'message': 'Data received',
        'prediction': prediction
    }), 201

@api.route('/api/dashboard', methods=['GET'])
# @token_required # Uncomment to enforce Auth, but for dev/testing ease we might leave open or handle quickly
# The prompt says "After login... Dashboard visible only after login".
# We should enforce it on Frontend. The API usually should be protected.
# Let's protect it.
@token_required
def get_dashboard_data(current_user):
    latest = SensorData.query.order_by(SensorData.timestamp.desc()).first()
    
    if not latest:
        # Return mock data if empty (for new system)
        return jsonify({
            'csi': 0,
            'status': 'No Data',
            'primary_stress_factor': 'Waiting for sensors...',
            'sensor_values': {
                'temperature': 0, 'humidity': 0, 'soil_moisture': 0,
                'light_intensity': 0, 'water_level': 0, 'intrusion_count': 0
            }
        })
        
    return jsonify({
        'csi': latest.csi,
        'status': latest.status,
        'primary_stress_factor': latest.primary_stress_factor,
        'timestamp': latest.timestamp.isoformat(),
        'sensor_values': {
            'temperature': latest.temperature,
            'humidity': latest.humidity,
            'soil_moisture': latest.soil_moisture,
            'light_intensity': latest.light_intensity,
            'water_level': latest.water_level,
            'intrusion_count': latest.intrusion_count
        }
    })

@api.route('/api/history', methods=['GET'])
@token_required
def get_history(current_user):
    # Fetch last 20 readings
    readings = SensorData.query.order_by(SensorData.timestamp.desc()).limit(20).all()
    
    # Reverse to show chronological order in charts
    history = []
    for r in reversed(readings):
        history.append({
            'time': r.timestamp.strftime('%H:%M:%S'),
            'csi': r.csi,
            'temperature': r.temperature,
            'humidity': r.humidity
        })
        
    return jsonify(history)
