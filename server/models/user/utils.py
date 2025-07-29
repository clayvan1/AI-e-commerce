from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_IN = 3600  


def hash_password(password):
    return generate_password_hash(password)

def verify_password(password, hashed_password):
    return check_password_hash(hashed_password, password)


def is_superadmin(user):
    return getattr(user, "role", None) == "superadmin"

def is_shopkeeper(user):
    return getattr(user, "role", None) == "shopkeeper"

def is_buyer(user):
    return getattr(user, "role", None) == "buyer"

def generate_token(user_id, role, expires_in=JWT_EXPIRES_IN):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(seconds=expires_in)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def sanitize_user(user):
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }

def is_valid_email(email):
    return (
        isinstance(email, str)
        and "@" in email
        and "." in email.split("@")[-1]
    )

def is_strong_password(password):
    return (
        isinstance(password, str)
        and len(password) >= 8
        and any(c.islower() for c in password)
        and any(c.isupper() for c in password)
        and any(c.isdigit() for c in password)
    )
