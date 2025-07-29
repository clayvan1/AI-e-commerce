# models/product_image.py (or wherever you keep your models)

from extension import db
from sqlalchemy_serializer import SerializerMixin
from flask import request

class ProductImage(db.Model, SerializerMixin):
    __tablename__ = 'product_images'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    alt_text = db.Column(db.String(255), nullable=True)

    product = db.relationship('Product', back_populates='images', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "image_url": request.url_root.rstrip('/') + self.image_url,
            "alt_text": self.alt_text
        }
