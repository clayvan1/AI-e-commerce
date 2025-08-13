
from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from werkzeug.security import generate_password_hash
from models.user.user import User
from extension import db
from models.user.utils import (
    hash_password,
    verify_password,
    generate_token,
    decode_token,
    is_valid_email,
    is_strong_password
)

user_bp = Blueprint('user_bp', __name__)
api = Api(user_bp)


def token_required(func):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return {"error": "Authorization token is missing"}, 401
        try:
            if token.startswith("Bearer "):
                actual_token = token.split("Bearer ")[1]
            else:
                return {"error": "Invalid token format (missing 'Bearer ' prefix)"}, 401

            decoded = decode_token(actual_token)
            if not decoded:
                return {"error": "Invalid or expired token"}, 401
            request.user_id = decoded["user_id"]
            request.user_role = decoded["role"]
            request.current_user = User.find_by_id(decoded["user_id"])
        except Exception as e:
            return {"error": f"Token decoding failed: {str(e)}"}, 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

def superadmin_required(func):
    @token_required
    def wrapper(*args, **kwargs):
        if not request.current_user or not request.current_user.is_superadmin():
            return {"error": "Access forbidden: Superadmin role required"}, 403
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
class UserRegisterResource(Resource):
    def post(self):
        data = request.get_json()
        if not data:
            return {"error": "Request body must be JSON"}, 400

        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}"}, 400

        if not is_valid_email(data['email']):
            return {"error": "Invalid email format"}, 400

        if not is_strong_password(data['password']):
            return {"error": "Password must be at least 8 characters long and contain a mix of uppercase, lowercase, digits, and special characters."}, 400

        if User.find_by_email(data['email']):
            return {"error": "User with this email already exists"}, 409

        # --- Determine role ---
        first_user = User.query.count() == 0  # True if no users exist
        if first_user:
            role = 'superadmin'  # First user is automatically superadmin
        else:
            role = data.get('role', 'buyer')
            if role not in ['buyer', 'shopkeeper', 'superadmin']:
                return {"error": "Invalid role specified."}, 403

        try:
            new_user = User(
                username=data['username'],
                email=data['email'],
                password_hash=hash_password(data['password']),
                role=role
            )
            db.session.add(new_user)
            db.session.commit()
            return new_user.sanitize(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to register user: {str(e)}"}, 500

class UserLoginResource(Resource):
    def post(self):
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return {"error": "Missing email or password"}, 400

        user = User.find_by_email(data['email'])
        if not user or not verify_password(data['password'], user.password_hash):
            return {"error": "Invalid credentials"}, 401

        token = generate_token(user.id, user.role)
        return {
            "token": token,
            "user": user.sanitize(),
            "role": user.role
        }, 200

class UserListResource(Resource):
    @superadmin_required
    def get(self):
        users = User.query.all()
        return [user.sanitize() for user in users], 200

class UserResource(Resource):
    def get(self, user_id):
        user = User.find_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404
        return user.sanitize(), 200

    @superadmin_required
    def delete(self, user_id):
        user = User.find_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404

        if user.id == request.user_id and user.is_superadmin():
            other_superadmins = User.query.filter(User.role == 'superadmin', User.id != user_id).count()
            if other_superadmins == 0:
                return {"error": "Cannot delete the last superadmin user."}, 403

        try:
            db.session.delete(user)
            db.session.commit()
            return {"message": "User deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to delete user: {str(e)}"}, 500

class UserRoleUpdateResource(Resource):
    @superadmin_required
    def put(self, user_id):
        data = request.get_json()
        if not data or 'role' not in data:
            return {"error": "Missing role in request body"}, 400

        user = User.find_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404

        new_role = data['role']
        if new_role not in ["buyer", "shopkeeper", "superadmin"]:
            return {"error": "Invalid role. Allowed roles are 'buyer', 'shopkeeper', 'superadmin'"}, 400

        if user.id == request.user_id and user.is_superadmin() and new_role != 'superadmin':
            other_superadmins = User.query.filter(User.role == 'superadmin', User.id != user_id).count()
            if other_superadmins == 0:
                return {"error": "Cannot change the role of the last superadmin user to a non-superadmin role."}, 403

        try:
            user.role = new_role
            db.session.commit()
            return {"message": f"User role updated to {new_role}", "user": user.sanitize()}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to update user role: {str(e)}"}, 500

api.add_resource(UserRegisterResource, '/users/register')
api.add_resource(UserLoginResource, '/users/login')
api.add_resource(UserListResource, '/users')
api.add_resource(UserResource, '/users/<int:user_id>')
api.add_resource(UserRoleUpdateResource, '/users/<int:user_id>/role')