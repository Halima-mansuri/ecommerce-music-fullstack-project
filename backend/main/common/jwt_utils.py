import jwt
import datetime
import os
from flask import request
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "superjwtkey")


def generate_token(user_id, role, expires_in=3600):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
    return token if isinstance(token, str) else token.decode('utf-8')


def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return {"code": 401, "message": "Authorization header must start with Bearer", "status": 0}, 401

        token = auth_header.split("Bearer ")[1]

        if not token:
            return {"code": 401, "message": "Token is missing!", "status": 0}, 401

        data = decode_token(token)
        if not data:
            return {"code": 401, "message": "Token is invalid or expired!", "status": 0}, 401

        return f(*args, **kwargs, user_id=data['user_id'], role=data['role'])

    return decorated
