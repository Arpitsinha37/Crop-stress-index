from flask import Flask
from flask_cors import CORS
from models import db
from routes import api
import os

app = Flask(__name__)
# Enable CORS for all routes (important for React frontend)
CORS(app)

# Database Config
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

app.register_blueprint(api)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database initialized.")
        
    app.run(debug=True, port=5000)
