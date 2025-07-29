from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# --- Import extensions ---
from extension import db

# --- Import blueprints ---
from routes.Category import category_bp
from routes.user import user_bp
from routes.order import order_bp
from routes.product import product_bp
from routes.agent import agent_bp

# --- Import Flask-RESTful resource ---
from routes.Socket import SocketEventEmitResource

# ✅ LiveKit bridge (without socketio)
from livekit_bridge import start_livekit_listener_background

# --- Import models to register with SQLAlchemy ---
from models.user.user import User
from models.product.product import Product
from models.product.Category import Category
from models.product.Images import ProductImage
from models.order.orders import Order

migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # === Configuration ===
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default-secret")
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///ecom.db")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    # === Upload folder ===
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # === Initialize extensions ===
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    # === Register blueprints ===
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(order_bp, url_prefix='/api')
    app.register_blueprint(product_bp, url_prefix='/api')
    app.register_blueprint(category_bp)
    app.register_blueprint(agent_bp, url_prefix='/api/agent')

    # === Flask-RESTful API setup ===
    api = Api(app)
    

    return app

if __name__ == "__main__":
    app = create_app()

    # === LiveKit config ===
    LIVEKIT_ROOM_NAME = os.getenv("LIVEKIT_ROOM_NAME", "shopping-agent-room")
    LIVEKIT_BRIDGE_IDENTITY = os.getenv("LIVEKIT_BRIDGE_IDENTITY", "flask-bridge")

    # === Start LiveKit bridge listener (after delay)
    start_livekit_listener_background(LIVEKIT_ROOM_NAME, LIVEKIT_BRIDGE_IDENTITY)

    # ✅ Run Flask app
    try:
        app.run(debug=True, host="0.0.0.0", port=5555)
    finally:
        print("Flask app shutdown — clean up if needed.")
