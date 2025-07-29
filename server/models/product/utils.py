from extension import db
from models.product.product import Product

from models.order.orders import OrderItem
from datetime import datetime
from sqlalchemy import func

# -----------------------------
# Create New Product
# -----------------------------
def create_product(name, description, price, quantity, category=None, restock_date=None):
    product = Product(
        name=name,
        description=description,
        price=price,
        quantity=quantity,
        category=category,
        restock_date=restock_date
    )
    db.session.add(product)
    db.session.commit()
    return product

# -----------------------------
# Update Product Info
# -----------------------------
def update_product(product_id, updates):
    product = Product.query.get(product_id)
    if not product:
        return None

    for field in ['name', 'description', 'price', 'quantity', 'category', 'restock_date']:
        if field in updates:
            setattr(product, field, updates[field])

    product.updated_at = datetime.utcnow()
    db.session.commit()
    return product

# -----------------------------
# Delete Product
# -----------------------------
def delete_product(product_id):
    product = Product.query.get(product_id)
    if product:
        db.session.delete(product)
        db.session.commit()
        return True
    return False

# -----------------------------
# Stock Adjustment
# -----------------------------
def increase_stock(product_id, amount):
    product = Product.query.get(product_id)
    if product:
        product.quantity += amount
        db.session.commit()
        return product
    return None

def decrease_stock(product_id, amount):
    product = Product.query.get(product_id)
    if product and product.quantity >= amount:
        product.quantity -= amount
        db.session.commit()
        return product
    return None

# -----------------------------
# Get Products
# -----------------------------
def get_all_products():
    return Product.query.order_by(Product.created_at.desc()).all()

def get_product_by_id(product_id):
    return Product.query.get(product_id)

# -----------------------------
# Get Products by Category
# -----------------------------
def get_products_by_category(category):
    return Product.query.filter_by(category=category).all()

# -----------------------------
# Search Products by Keyword
# -----------------------------
def search_products(keyword):
    return Product.query.filter(
        Product.name.ilike(f"%{keyword}%") | Product.description.ilike(f"%{keyword}%")
    ).all()

# -----------------------------
# Most Popular Products
# -----------------------------derItem  # adjust this import path as needed

def get_most_popular_products(limit=10):
    return (
        db.session.query(Product, func.count(OrderItem.id).label("order_count"))
        .join(OrderItem, Product.id == OrderItem.product_id)
        .filter(
            Product.shop_keeper_id.isnot(None),
            Product.is_published == True,
            Product.quantity > 0
        )
        .group_by(Product.id)
        .order_by(func.count(OrderItem.id).desc())
        .limit(limit)
        .all()
    )
