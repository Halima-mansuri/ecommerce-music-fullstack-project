import os
import stripe
from flask import request
from flask_restful import Resource
from datetime import datetime
from collections import defaultdict
from main.database.models import db, CartItem, Product, Order, OrderItem, Coupon, User
from main.common.jwt_utils import token_required
from dotenv import load_dotenv
load_dotenv()

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

class ApplyCouponResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can apply coupons", "status": 0}, 403

        data = request.get_json() or {}
        product_id = data.get("product_id")
        coupon_code = data.get("coupon_code")

        if not product_id or not coupon_code:
            return {"code": 400, "message": "Product ID and coupon code are required", "status": 0}, 400

        cart_item = CartItem.query.filter_by(buyer_id=user_id, product_id=product_id).first()
        if not cart_item:
            return {
                "code": 400,
                "message": "Product must be in cart before applying a coupon",
                "status": 0
            }, 400

        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            return {"code": 404, "message": "Product not found or has been removed", "status": 0}, 404

        coupon = Coupon.query.filter_by(code=coupon_code, product_id=product_id).first()
        if not coupon or not coupon.is_valid():
            return {"code": 404, "message": "Invalid or expired coupon", "status": 0}, 404

        return {
            "code": 200,
            "message": "Coupon applied",
            "discount_percent": coupon.discount_percent,
            "status": 1
        }, 200

class CheckoutResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can checkout", "status": 0}, 403

        existing_order = Order.query.filter_by(buyer_id=user_id, status='pending').first()
        if existing_order:
            return {
                "code": 409,
                "message": "You already have a pending order. Please complete or cancel it before starting a new checkout.",
                "status": 0
            }, 409

        data = request.get_json() or {}
        coupons = data.get("coupons", {})

        cart_items = CartItem.query.filter_by(buyer_id=user_id).all()
        if not cart_items:
            return {"code": 400, "message": "Cart is empty", "status": 0}, 400

        seller_cart = defaultdict(list)
        for item in cart_items:
            product = Product.query.get(item.product_id)
            if not product or product.is_deleted:
                continue
            seller_cart[product.seller_id].append({
                "item": item,
                "product": product
            })

        if not seller_cart:
            return {"code": 400, "message": "No valid products found in cart", "status": 0}, 400

        checkout_sessions = []

        for seller_id, entries in seller_cart.items():
            seller = User.query.get(seller_id)
            if not seller or not seller.stripe_account_id:
                continue

            try:
                line_items = []
                order_total = 0
                order_items = []

                for entry in entries:
                    product = entry["product"]
                    item = entry["item"]
                    price = product.price

                    coupon_code = coupons.get(str(product.id))
                    if coupon_code:
                        coupon = Coupon.query.filter_by(code=coupon_code, product_id=product.id).first()
                        if coupon and coupon.is_valid():
                            price *= (1 - coupon.discount_percent / 100)

                    price = round(price, 2)
                    order_total += price
                    order_items.append({"product_id": product.id, "price": price})

                    line_items.append({
                        "price_data": {
                            "currency": "usd",
                            "product_data": {"name": product.title},
                            "unit_amount": int(price * 100),
                        },
                        "quantity": 1,
                    })

                if not line_items:
                    continue

                session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
                    line_items=line_items,
                    mode="payment",
                    success_url="http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url="http://localhost:3000/cart",
                    payment_intent_data={
                        "application_fee_amount": int(order_total * 0.1 * 100),
                        "transfer_data": {
                            "destination": seller.stripe_account_id
                        }
                    },
                )

                order = Order(
                    buyer_id=user_id,
                    total_price=round(order_total, 2),
                    payment_method="stripe",
                    stripe_payment_id=session.id,
                    status="pending"
                )
                db.session.add(order)
                db.session.flush()

                for item in order_items:
                    db.session.add(OrderItem(
                        order_id=order.id,
                        product_id=item["product_id"],
                        price=item["price"]
                    ))

                checkout_sessions.append({
                    "seller_id": seller_id,
                    "checkout_url": session.url
                })

            except Exception:
                continue

        db.session.commit()

        if not checkout_sessions:
            return {
                "code": 400,
                "message": "No valid sellers with Stripe accounts found for checkout.",
                "status": 0
            }, 400

        return {"code": 200, "sessions": checkout_sessions, "status": 1}, 200
