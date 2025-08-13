from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from dotenv import load_dotenv
import os

# Load env vars for local dev
load_dotenv()

# --- Import extensions ---
from extension import db

# --- Import blueprints ---
from routes.Category import category_bp
from routes.user import user_bp
from routes.order import order_bp
from routes.product import product_bp
from routes.agent import agent_bp

# --- Import LiveKit bridge ---
from livekit_bridge import start_livekit_listener_background

# --- Import models ---
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

    # ✅ Use Render's DATABASE_URL if available
    database_url = os.getenv("DATABASE_URL", "sqlite:///ecom.db")
    # Render Postgres fix: replace old URI prefix
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

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

    # === Flask-RESTful API ===
    api = Api(app)

    return app

app = create_app()
if __name__ == "__main__":


    # === LiveKit ===
    LIVEKIT_ROOM_NAME = os.getenv("LIVEKIT_ROOM_NAME", "shopping-agent-room")
    LIVEKIT_BRIDGE_IDENTITY = os.getenv("LIVEKIT_BRIDGE_IDENTITY", "flask-bridge")

    start_livekit_listener_background(LIVEKIT_ROOM_NAME, LIVEKIT_BRIDGE_IDENTITY)

    # Run locally (Render will use Gunicorn from render.yaml)
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
