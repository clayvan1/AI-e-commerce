from extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

class Product(db.Model, SerializerMixin):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)

    price = db.Column(db.Float, nullable=False)
    old_price = db.Column(db.Float, nullable=True)
    is_on_offer = db.Column(db.Boolean, default=False)

    quantity = db.Column(db.Integer, nullable=False, default=0)
    restock_date = db.Column(db.DateTime, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)  # Legacy fallback
    is_published = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    shop_keeper_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    source_product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)

    # Relationships
    shopkeeper = db.relationship('User', back_populates='products', lazy=True)
    category = db.relationship('Category', back_populates='products', lazy=True)
    order_items = db.relationship('OrderItem', back_populates='product', lazy=True)
    source_product = db.relationship('Product', remote_side=[id], backref='stocked_clones', lazy=True)

    images = db.relationship('ProductImage', back_populates='product', cascade='all, delete-orphan', lazy=True)

    serialize_rules = (
        '-order_items',
        '-shopkeeper.products',
        '-shopkeeper.password_hash',
        '-shopkeeper.orders',
        '-source_product.stocked_clones',
        '-category.products',
        '-images.product', 
        'is_published',
    )

    def to_dict(self):
     return {
        "id": self.id,
        "name": self.name,
        "description": self.description,
        "price": self.price,
        "old_price": self.old_price,
        "is_on_offer": self.is_on_offer,
        "quantity": self.quantity,
        "restock_date": self.restock_date.isoformat() if self.restock_date else None,
        "image_url": self.image_url,  # legacy support
        "images": [img.to_dict() for img in self.images] if self.images else [],
        "created_at": self.created_at.isoformat() if self.created_at else None,
        "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        "category_id": self.category_id,
        "shop_keeper_id": self.shop_keeper_id,
        "source_product_id": self.source_product_id,
         "is_published": self.is_published
    }


    def __repr__(self):
        return f"<Product {self.name} - Stock: {self.quantity}>"
