# app.py — Flask backend for AI E-commerce
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# --- Extensions ---
from extension import db

# --- Blueprints ---
from routes.Category import category_bp
from routes.user import user_bp
from routes.order import order_bp
from routes.product import product_bp
from routes.agent import agent_bp

# --- Models ---
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

    # Database URL (Supabase/Postgres or fallback to local SQLite)
    database_url = os.getenv("DATABASE_URL", "sqlite:///ecom.db")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    if "supabase.co" in database_url and "?sslmode=" not in database_url:
        database_url += "?sslmode=require"

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    # Upload folder
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

# Create app instance
app = create_app()

# --- Run locally ---
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5555))
    app.run(debug=True, host="0.0.0.0", port=port)
