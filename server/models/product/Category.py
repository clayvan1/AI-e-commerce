from extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)

    products = db.relationship('Product', back_populates='category', lazy=True)

    # Prevent circular serialization of products
    serialize_rules = (
        '-products.category',  # prevent infinite loop
        '-products.shopkeeper',
        '-products.order_items',
        '-products.source_product',
        '-products.stocked_clones'
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
        }

    def __repr__(self):
        return f"<Category {self.name}>"
