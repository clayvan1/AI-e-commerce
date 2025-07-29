from extension import db
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  

    
    orders = db.relationship('Order', back_populates='buyer', lazy=True)
    products = db.relationship('Product', back_populates='shopkeeper', lazy=True)

    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


    def is_superadmin(self):
        return self.role == "superadmin"

    def is_shopkeeper(self):
        return self.role == "shopkeeper"

    def is_buyer(self):
        return self.role == "buyer"


    serialize_rules = (
        '-password_hash',
        '-orders',
        '-products.shopkeeper',
        '-products.order_items',
    )

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.get(user_id)

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    def sanitize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
        }
