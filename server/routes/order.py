from flask import Blueprint, request
from flask_restful import Api, Resource
from extension import db
from models.order.orders import Order, OrderItem
from models.product.product import Product
from models.user.user import User
from models.user.utils import decode_token

order_bp = Blueprint("order_bp", __name__)
api = Api(order_bp)


def token_required(func):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return {"error": "Authorization token is missing"}, 401
        try:
            actual_token = token.split("Bearer ")[-1]
            decoded = decode_token(actual_token)
            if not decoded:
                return {"error": "Invalid or expired token"}, 401
            request.user_id = decoded["user_id"]
            request.current_user = User.find_by_id(request.user_id)
        except Exception as e:
            return {"error": f"Token decoding failed: {str(e)}"}, 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

def shopkeeper_required(func):
    @token_required
    def wrapper(*args, **kwargs):
        if not request.current_user or not request.current_user.is_shopkeeper():
            return {"error": "Access forbidden: Shopkeeper role required"}, 403
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

def buyer_required(func):
    @token_required
    def wrapper(*args, **kwargs):
        if not request.current_user or not request.current_user.is_buyer():
            return {"error": "Access forbidden: Buyer role required"}, 403
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

class OrderListCreateResource(Resource):
    @buyer_required
    def post(self):
        data = request.json
        required_fields = [
            "full_name", "address_line", "city", "postal_code", "country", "items"
        ]
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}"}, 400

        items_data = data["items"]
        if not isinstance(items_data, list) or len(items_data) == 0:
            return {"error": "Order must contain at least one item"}, 400

        try:
            new_order = Order(
                buyer_id=request.user_id,
                full_name=data["full_name"],
                address_line=data["address_line"],
                city=data["city"],
                postal_code=data["postal_code"],
                country=data["country"]
                
            )
            db.session.add(new_order)
            db.session.flush()

            for item in items_data:
                product = Product.query.get(item["product_id"])
                if not product:
                    db.session.rollback()
                    return {"error": f"Product ID {item['product_id']} not found"}, 404

                order_item = OrderItem(
                    order_id=new_order.id,
                    product_id=product.id,
                    quantity=item["quantity"]
                )
                db.session.add(order_item)

            db.session.commit()
            return {
                "message": "Order created successfully",
                "order": new_order.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Order creation failed: {str(e)}"}, 500

    @token_required
    def get(self):
        user = request.current_user
        if user.is_buyer():
            orders = Order.query.filter_by(buyer_id=user.id).all()
        elif user.is_shopkeeper():
            orders = Order.query.all()
        else:
            return {"error": "Unauthorized access"}, 403

        return [order.to_dict() for order in orders], 200


class OrderStatusUpdateResource(Resource):
    @shopkeeper_required
    def put(self, order_id):
        data = request.json
        new_status = data.get("status")
        if new_status not in ["shipped", "delivered"]:
            return {"error": "Invalid status value"}, 400

        order = Order.query.get(order_id)
        if not order:
            return {"error": "Order not found"}, 404

        try:
            order.status = new_status
            db.session.commit()
            return {"message": f"Order marked as {new_status}"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to update order: {str(e)}"}, 500


api.add_resource(OrderListCreateResource, "/orders")
api.add_resource(OrderStatusUpdateResource, "/orders/<int:order_id>/status")
