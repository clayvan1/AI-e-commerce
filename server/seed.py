from app import create_app
from extension import db
from models.user.user import User
from models.product.product import Product
from models.order.orders import Order
from models.order.orders import OrderItem
from datetime import datetime

app = create_app()

with app.app_context():
    print("🧨 Resetting the database...")
    db.drop_all()
    db.create_all()

    print("👥 Creating users...")
    seller = User(
        username="aliceseller",
        email="alice@sell.com",
        password_hash="hashedpw123",  # TODO: hash properly in real apps
        role="shopkeeper"
    )

    buyer = User(
        username="bobbuyer",
        email="bob@buy.com",
        password_hash="hashedpw123",
        role="buyer"
    )

    db.session.add_all([seller, buyer])
    db.session.commit()

    print("📦 Adding products...")
    product1 = Product(
        name="Smartphone X1",
        description="Sleek new phone",
        price=499.99,
        category="Electronics",
        quantity=10,
        restock_date=datetime(2025, 7, 1),
        image_url="https://cdn.example.com/products/phone.jpg",
        
    )

    product2 = Product(
        name="Bluetooth Headphones",
        description="Noise-cancelling over-ear headphones",
        price=149.99,
        category="Audio",
        quantity=20,
        image_url="https://cdn.example.com/products/headphones.jpg",
        restock_date=None,
        
    )

    db.session.add_all([product1, product2])
    db.session.commit()

    print("🧾 Creating an order...")
    order = Order(
        buyer_id=buyer.id,
        status="pending",
        full_name="Bob Buyer",
        address_line="123 Main Street",
        city="Nairobi",
        postal_code="00100",
        country="Kenya",
        created_at=datetime.utcnow()
    )

    db.session.add(order)
    db.session.commit()

    print("🧩 Adding order items...")
    item1 = OrderItem(
        order_id=order.id,
        product_id=product1.id,
        quantity=1
    )

    item2 = OrderItem(
        order_id=order.id,
        product_id=product2.id,
        quantity=2
    )

    db.session.add_all([item1, item2])
    db.session.commit()

    print("✅ Database seeded successfully!")
