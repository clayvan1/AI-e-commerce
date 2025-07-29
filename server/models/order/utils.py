from extension import db
from .orders import Order, OrderItem
from product.product import Product

# -----------------------------
# Create Order with Items & Shipping
# -----------------------------
def create_order_with_shipping(buyer_id, shipping_data, cart_items):
    """
    Create a new order with shipping details and multiple items.

    :param buyer_id: int
    :param shipping_data: dict with full_name, address_line, city, postal_code, country
    :param cart_items: list of dicts → [{"product_id": int, "quantity": int}, ...]
    :return: Order instance
    """
    order = Order(
        buyer_id=buyer_id,
        full_name=shipping_data['full_name'],
        address_line=shipping_data['address_line'],
        city=shipping_data['city'],
        postal_code=shipping_data['postal_code'],
        country=shipping_data['country']
    )
    db.session.add(order)
    db.session.flush()  # so order.id is available

    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item['product_id'],
            quantity=item['quantity']
        )
        db.session.add(order_item)

    db.session.commit()
    return order

# -----------------------------
# Query Orders
# -----------------------------
def get_orders_by_user(user_id):
    return Order.query.filter_by(buyer_id=user_id).order_by(Order.created_at.desc()).all()

def get_order_by_id(order_id):
    return Order.query.get(order_id)

# -----------------------------
# Status Helpers
# -----------------------------
def mark_order_as_shipped(order):
    order.status = "shipped"
    db.session.commit()

def mark_order_as_delivered(order):
    order.status = "delivered"
    db.session.commit()

def is_order_pending(order):
    return order.status == "pending"

# -----------------------------
# Optional: Calculate Order Total
# -----------------------------
def calculate_order_total(order):
    total = 0
    for item in order.items:
        product = Product.query.get(item.product_id)
        if product:
            total += product.price * item.quantity
    return total
