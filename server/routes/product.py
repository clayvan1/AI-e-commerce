from flask import request, Blueprint, current_app, url_for
from flask_restful import Api, Resource
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from datetime import datetime, timedelta
from extension import db
from models.product.product import Product
from models.product.Images import ProductImage
from routes.user import shopkeeper_required, superadmin_required
from models.product.utils import get_most_popular_products


product_bp = Blueprint('product_bp', __name__)
api = Api(product_bp)

# ------------------ SUPERADMIN ------------------

class GlobalProductListResource(Resource):
    @superadmin_required
    def get(self):
        try:
            products = Product.query.filter_by(shop_keeper_id=None).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] GlobalProductListResource: {e}")
            return {"error": "Failed to fetch products"}, 500


class GlobalProductCreateResource(Resource):
    @superadmin_required
    def post(self):
        data = request.form
        images = request.files.getlist('images')

        # Validate fields
        required_fields = ['name', 'description', 'price', 'category_id', 'quantity']
        for field in required_fields:
            if not data.get(field):
                return {"error": f"{field} is required"}, 400

        try:
            price = float(data['price'])
            quantity = int(data['quantity'])
            category_id = int(data['category_id'])
            old_price = float(data['old_price']) if data.get('old_price') else None
            is_on_offer = data.get('is_on_offer', 'false').lower() == 'true'
        except ValueError:
            return {"error": "Invalid numeric input"}, 400

        try:
            product = Product(
                name=data['name'],
                description=data['description'],
                price=price,
                old_price=old_price,
                is_on_offer=is_on_offer,
                quantity=quantity,
                category_id=category_id,
                shop_keeper_id=None,
                is_published=False
            )
            db.session.add(product)
            db.session.flush()

            for img in images:
                filename = secure_filename(img.filename)
                unique_name = f"{datetime.utcnow().timestamp()}_{filename}"
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                img.save(save_path)

                # Relative path for static file
                relative_path = f"/static/uploads/{unique_name}"
                db.session.add(ProductImage(
                    product_id=product.id,
                    image_url=relative_path
                ))

            db.session.commit()
            return product.to_dict(), 201

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] GlobalProductCreateResource: {e}")
            return {"error": "Failed to add product"}, 500

# ------------------ SHOPKEEPER ------------------

class ShopkeeperProductResource(Resource):
    @shopkeeper_required
    def get(self):
        try:
            products = Product.query.filter_by(shop_keeper_id=request.user_id)\
                .filter(Product.source_product_id.isnot(None)).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] ShopkeeperProductResource: {e}")
            return {"error": "Failed to fetch your inventory"}, 500


class GlobalInventoryResource(Resource):
    @shopkeeper_required
    def get(self):
        try:
            products = Product.query.filter_by(shop_keeper_id=None).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] GlobalInventoryResource: {e}")
            return {"error": "Failed to fetch global inventory"}, 500


class StockInProductResource(Resource):
    @shopkeeper_required
    def post(self):
        data = request.get_json()
        product_id = data.get("product_id")
        quantity = data.get("quantity")

        if not product_id or quantity is None:
            return {"error": "Product ID and quantity required"}, 400

        try:
            quantity = int(quantity)
            if quantity <= 0:
                return {"error": "Quantity must be positive"}, 400
        except ValueError:
            return {"error": "Quantity must be an integer"}, 400

        global_product = Product.query.filter_by(id=product_id, shop_keeper_id=None).first()
        if not global_product:
            return {"error": "Global product not found"}, 404

        if global_product.quantity < quantity:
            return {"error": f"Only {global_product.quantity} in stock"}, 400

        try:
            global_product.quantity -= quantity

            shop_product = Product(
                name=global_product.name,
                description=global_product.description,
                price=global_product.price,
                old_price=global_product.old_price,
                is_on_offer=global_product.is_on_offer,
                quantity=quantity,
                shop_keeper_id=request.user_id,
                source_product_id=global_product.id,
                category_id=global_product.category_id,
                is_published=False
            )
            db.session.add(shop_product)
            db.session.flush()

            for img in global_product.images:
                db.session.add(ProductImage(
                    product_id=shop_product.id,
                    image_url=img.image_url
                ))

            db.session.commit()
            return shop_product.to_dict(), 201

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] StockInProductResource: {e}")
            return {"error": "Stock-in failed"}, 500

class ProductUpdateDeleteResource(Resource):
    @shopkeeper_required
    def put(self, product_id):
        product = Product.query.get(product_id)
        if not product or product.shop_keeper_id != request.user_id:
            return {"error": "Not found or unauthorized"}, 404

        data = request.get_json()
        try:
            for field in ['name', 'description', 'category_id']:
                if field in data:
                    setattr(product, field, data[field])

            if 'quantity' in data:
                product.quantity = max(0, int(data['quantity']))

            if 'price' in data:
                price = float(data['price'])
                if product.is_on_offer and price != product.price:
                    product.old_price = product.price
                product.price = price

            if 'old_price' in data:
                product.old_price = float(data['old_price'])

            if 'is_on_offer' in data:
                product.is_on_offer = bool(data['is_on_offer'])

            if 'is_published' in data:
                product.is_published = bool(data['is_published'])

            product.updated_at = datetime.utcnow()
            db.session.commit()
            return product.to_dict(), 200

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] ProductUpdate: {e}")
            return {"error": "Update failed"}, 500

    @shopkeeper_required
    def delete(self, product_id):
        product = Product.query.get(product_id)
        if not product or product.shop_keeper_id != request.user_id:
            return {"error": "Not found or unauthorized"}, 404

        try:
            db.session.delete(product)
            db.session.commit()
            return {"message": "Deleted"}, 200
        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] ProductDelete: {e}")
            return {"error": "Deletion failed"}, 500

# ------------------ PUBLIC ------------------

class BuyerProductListResource(Resource):
    def get(self):
        try:
            products = Product.query.filter(
                Product.shop_keeper_id.isnot(None),
                Product.is_published == True,
                Product.quantity > 0
            ).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] BuyerProductList: {e}")
            return {"error": "Failed to load products"}, 500


class BuyerProductsByCategoryResource(Resource):
    def get(self, category_id):
        try:
            products = Product.query.filter(
                Product.shop_keeper_id.isnot(None),
                Product.category_id == category_id,
                Product.quantity > 0,
                Product.is_published == True
            ).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] CategoryProductList: {e}")
            return {"error": "Failed to load category products"}, 500


class SingleProductResource(Resource):
    def get(self, product_id):
        try:
            product = Product.query.get_or_404(product_id)
            if not product.is_published or product.shop_keeper_id is None or product.quantity < 1:
                return {"error": "Product not available"}, 404
            return product.to_dict(), 200
        except Exception as e:
            print(f"[ERROR] SingleProductResource: {e}")
            return {"error": "Failed to fetch product"}, 500
class PublicOfferProductsResource(Resource):
    def get(self):
        try:
            products = Product.query.filter(
                Product.shop_keeper_id.isnot(None),
                Product.is_published == True,
                Product.quantity > 0,
                Product.is_on_offer == True
            ).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] OfferProducts: {e}")
            return {"error": "Failed to load offers"}, 500
class NewArrivalsResource(Resource):
    def get(self):
        try:
            one_week_ago = datetime.utcnow() - timedelta(days=7)
            products = Product.query.filter(
                Product.created_at >= one_week_ago,
                Product.shop_keeper_id.isnot(None),
                Product.is_published == True,
                Product.quantity > 0
            ).order_by(Product.created_at.desc()).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            print(f"[ERROR] NewArrivalsResource: {e}")
            return {"error": "Failed to load new arrivals"}, 500

class TrendingProductsResource(Resource):
    def get(self):
        try:
            popular_products = get_most_popular_products(limit=10)
            return [product.to_dict() for product, _ in popular_products], 200
        except Exception as e:
            print(f"[ERROR] TrendingProducts: {e}")
            return {"error": "Failed to load trending products"}, 500


api.add_resource(NewArrivalsResource, '/products/new')
api.add_resource(PublicOfferProductsResource, '/products/offers')
api.add_resource(TrendingProductsResource, '/products/trending')


api.add_resource(GlobalProductListResource, '/admin/products')
api.add_resource(GlobalProductCreateResource, '/admin/products')
api.add_resource(GlobalInventoryResource, '/inventory/global')
api.add_resource(StockInProductResource, '/inventory/stock-in')
api.add_resource(ShopkeeperProductResource, '/inventory')
api.add_resource(ProductUpdateDeleteResource, '/products/<int:product_id>')
api.add_resource(BuyerProductListResource, '/products')
api.add_resource(BuyerProductsByCategoryResource, '/products/category/<int:category_id>')
api.add_resource(SingleProductResource, '/products/<int:product_id>')
