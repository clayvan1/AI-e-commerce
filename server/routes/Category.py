from flask import Blueprint, request, current_app, url_for
from flask_restful import Resource, Api
from models.product.Category import Category
from models.product.product import Product
from extension import db
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from routes.user import superadmin_required  # optional

category_bp = Blueprint('category_bp', __name__)
api = Api(category_bp)

# === Helper: Generate full image URL ===
def full_image_url(image_path):
    if image_path:
        # Strip 'static/' prefix if present
        static_path = image_path.replace('static/', '')
        return url_for('static', filename=static_path, _external=True)
    return None

# === GET + POST /api/categories ===
class CategoryList(Resource):
    def get(self):
        categories = Category.query.all()
        return [{
            "id": cat.id,
            "name": cat.name,
            "image_url": full_image_url(cat.image_url)
        } for cat in categories], 200

    @superadmin_required  # Remove if not needed
    def post(self):
        data = request.form
        image = request.files.get("image")
        name = data.get("name")

        if not name:
            return {"error": "Category name is required"}, 400

        if Category.query.filter_by(name=name).first():
            return {"error": "Category already exists"}, 400

        image_url = None
        if image:
            filename = secure_filename(image.filename)
            unique_filename = f"{datetime.utcnow().timestamp()}_{filename}"
            upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            image.save(upload_path)
            image_url = f"static/uploads/{unique_filename}"

        try:
            category = Category(name=name, image_url=image_url)
            db.session.add(category)
            db.session.commit()

            return {
                "id": category.id,
                "name": category.name,
                "image_url": full_image_url(category.image_url)
            }, 201
        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] Failed to create category: {e}")
            return {"error": "Failed to create category"}, 500

# === GET /api/categories/<int:id> ===
class SingleCategory(Resource):
    def get(self, id):
        cat = Category.query.get_or_404(id)
        return {
            "id": cat.id,
            "name": cat.name,
            "image_url": full_image_url(cat.image_url)
        }, 200
class ProductsInCategory(Resource):
    def get(self, id):
        category = Category.query.get_or_404(id)

        products = Product.query.filter(
            Product.category_id == id,
            Product.shop_keeper_id.isnot(None),
            Product.is_published == True,
            Product.quantity > 0
        ).all()

        return [{
            **p.to_dict(),
            "image_url": full_image_url(p.image_url)
        } for p in products], 200



# === Register routes ===
api.add_resource(CategoryList, '/api/categories')
api.add_resource(SingleCategory, '/api/categories/<int:id>')
api.add_resource(ProductsInCategory, '/api/categories/<int:id>/products')
