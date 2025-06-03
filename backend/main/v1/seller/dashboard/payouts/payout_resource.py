from flask_restful import Resource
from flask import request
from datetime import datetime
from main.database.models import db, Order, Product, Payout
from main.common.jwt_utils import token_required
import stripe
import os

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

class RecordPayoutResource(Resource):
    def post(self):
        data = request.get_json() or {}
        session_id = data.get("session_id")
        if not session_id:
            return {"code": 400, "message": "Missing session_id", "status": 0}, 400

        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            return {"code": 500, "message": f"Stripe error: {str(e)}", "status": 0}, 500

        if session.payment_status != "paid":
            return {"code": 400, "message": "Payment not completed", "status": 0}, 400

        order = Order.query.filter_by(stripe_payment_id=session.id).first()
        if not order:
            return {"code": 404, "message": "Order not found", "status": 0}, 404

        if order.status != "paid":
            return {
                "code": 400,
                "message": "Order not marked as paid yet. Please wait for webhook to process.",
                "status": 0
            }, 400

        seller_earnings = {}

        for item in order.items:
            product = Product.query.get(item.product_id)
            if not product:
                continue
            seller_id = product.seller_id
            seller_earnings[seller_id] = seller_earnings.get(seller_id, 0) + item.price

        created_payouts = []
        for seller_id, gross_amount in seller_earnings.items():
            platform_fee = round(gross_amount * 0.10, 2)
            net_amount = round(gross_amount - platform_fee, 2)

            existing = Payout.query.filter_by(
                seller_id=seller_id,
                amount=net_amount,
                status="pending"
            ).first()
            if existing:
                continue

            payout = Payout(
                seller_id=seller_id,
                amount=net_amount,
                status="pending",
                date=datetime.utcnow()
            )
            db.session.add(payout)
            created_payouts.append({
                "seller_id": seller_id,
                "amount": net_amount
            })

        db.session.commit()

        return {
            "code": 200,
            "message": "Payouts recorded (if not already created)",
            "payouts": created_payouts,
            "status": 1
        }, 200


class SellerPayoutsResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "seller":
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        status_filter = request.args.get("status")  # Optional: 'pending' or 'paid'

        query = Payout.query.filter_by(seller_id=user_id)
        if status_filter in ["pending", "paid"]:
            query = query.filter_by(status=status_filter)

        payouts = query.order_by(Payout.date.desc()).all()

        result = [{
            "id": p.id,
            "amount": p.amount,
            "status": p.status,
            "date": p.date.isoformat()
        } for p in payouts]

        return {
            "code": 200,
            "message": "Payouts retrieved",
            "payouts": result,
            "status": 1
        }, 200
