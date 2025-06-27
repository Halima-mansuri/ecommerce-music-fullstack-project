import os
import stripe
from flask import request, jsonify
from flask_restful import Resource
from main.database.models import User, db
from main.extension import bcrypt
from main.common.jwt_utils import generate_token, token_required
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

VITE_API_BASE = os.environ.get("VITE_API_BASE", "http://192.168.1.2:5000")


class UserRegistrationResource(Resource):
    def post(self):
        data = request.get_json() or {}
        role = data.get("role")

        if role not in ["buyer", "seller", "admin"]:
            return {"code": 400, "message": "Invalid or missing role", "status": 0}, 400

        required_fields = ["email", "password", "name"]
        if role == "seller":
            required_fields.append("store_name")

        if not all(data.get(field) for field in required_fields):
            return {"code": 400, "message": "Missing required fields", "status": 0}, 400

        if User.query.filter_by(email=data["email"]).first():
            return {"code": 400, "message": "Email already registered", "status": 0}, 400

        new_user = User(
            name=data["name"],
            email=data["email"],
            role=role,
            store_name=data.get("store_name") if role == "seller" else None,
            password_hash=bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        )

        try:
            db.session.add(new_user)
            db.session.commit()

            onboarding_url = None
            if role == "seller":
                # Create Stripe account
                account = stripe.Account.create(
                    type="express",
                    email=data["email"],
                    business_type="individual",
                    country="US",
                    capabilities={
                        "card_payments": {"requested": True},
                        "transfers": {"requested": True},
                    }
                )
                new_user.stripe_account_id = account.id
                db.session.commit()

                # Create Stripe account onboarding link
                account_links = stripe.AccountLink.create(
                    account=account.id,
                    refresh_url=f"{VITE_API_BASE}/under-verification",
                    return_url=f"{VITE_API_BASE}/under-verification",
                    type="account_onboarding"
                )
                onboarding_url = account_links.url

            access_token = generate_token(new_user.id, new_user.role)

            return {
                "code": 201,
                "data": {
                    "id": new_user.id,
                    "email": new_user.email,
                    "name": new_user.name,
                    "role": new_user.role,
                    "store_name": new_user.store_name,
                    "is_approved": new_user.is_approved,  # ✅ ADD THIS
                    "stripe_account_id": new_user.stripe_account_id,
                    "stripe_onboarding_url": onboarding_url
                },
                "message": "User registered successfully",
                "status": 1,
                "token": access_token
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Registration failed: {str(e)}", "status": 0}, 500


class UserLoginResource(Resource):
    def post(self):
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not email or not password:
            return {
                "code": 400,
                "message": "Email and password are required",
                "status": 0
            }, 400

        user = User.query.filter_by(email=email).first()

        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return {
                "code": 401,
                "message": "Invalid credentials",
                "status": 0
            }, 401

        if not user.is_active:
            return {
                "code": 403,
                "message": "Your account has been blocked by admin.",
                "status": 0
            }, 403

        if user.is_deleted:
            return {
                "code": 410,
                "message": "Your account has been deleted.",
                "status": 0
            }, 410

        if role and user.role != role:
            return {
                "code": 403,
                "message": f"User does not have {role} access",
                "status": 0
            }, 403

        if user.role == "seller" and not user.is_approved:
            return {
                "code": 403,
                "message": "Your seller account is under verification.",
                "status": 0,
                "under_verification": True
            }, 403

        access_token = generate_token(user.id, user.role)

        return {
            "code": 200,
            "data": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "store_name": user.store_name,
                "is_approved": user.is_approved,  # ✅ Add this!
                "stripe_account_id": user.stripe_account_id
            },
            "message": "Login successful",
            "status": 1,
            "token": access_token
        }, 200


class UserProfileResource(Resource):
    @token_required
    def get(self, user_id, role):
        user = User.query.get(user_id)
        if not user:
            return {"code": 404, "message": "User not found", "status": 0}, 404

        if user.is_deleted:
            return {"code": 410, "message": "User account has been deleted", "status": 0}, 410

        return {
            "code": 200,
            "data": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "store_name": user.store_name,
                "stripe_account_id": user.stripe_account_id,
                "is_approved": user.is_approved
            },
            "status": 1
        }, 200

    @token_required
    def put(self, user_id, role):
        user = User.query.get(user_id)
        data = request.get_json() or {}

        if user.is_deleted:
            return {"code": 410, "message": "User account has been deleted", "status": 0}, 410

        if data.get("name"):
            user.name = data["name"]
        if data.get("email"):
            user.email = data["email"]
        if user.role == "seller" and data.get("store_name"):
            user.store_name = data["store_name"]

        try:
            db.session.commit()
            return {
                "code": 200,
                "message": "Profile updated",
                "status": 1,
                "data": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                    "store_name": user.store_name,
                    "is_approved": user.is_approved
                }
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Update failed: {str(e)}", "status": 0}, 500
