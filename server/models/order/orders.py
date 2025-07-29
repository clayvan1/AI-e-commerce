from extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    
    full_name = db.Column(db.String(120), nullable=False)
    address_line = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    

    buyer = db.relationship('User', back_populates='orders', lazy=True)
    items = db.relationship('OrderItem', back_populates='order', cascade='all, delete', lazy=True)

    
    serialize_rules = (
        '-buyer.orders',
        '-buyer.password_hash',
        '-items.order',
        '-items.product.order_items',
        '-items.product.shopkeeper.products',
    )

    def __repr__(self):
        return f"<Order #{self.id} by Buyer {self.buyer_id} | Status: {self.status}>"

class OrderItem(db.Model, SerializerMixin):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    
    order = db.relationship('Order', back_populates='items', lazy=True)
    product = db.relationship('Product', back_populates='order_items', lazy=True)

    
    serialize_rules = (
        '-order.items',
        '-product.order_items',
        '-product.shopkeeper.products',
    )

    def __repr__(self):
        return f"<OrderItem #{self.id} - Product {self.product_id} x {self.quantity}>"
