from flask import request
from flask_restful import Resource
import stripe
import os
from main.extension import db
from main.database.models import Order, Payout, Product, CartItem
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


class StripeWebhookResource(Resource):
    def post(self):
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            return {"message": "Invalid Stripe signature"}, 400
        except Exception as e:
            return {"message": f"Webhook error: {str(e)}"}, 400

        # ✅ Handle payment success
        if event['type'] == 'checkout.session.completed':
            try:
                session = event['data']['object']
                session_id = session.get('id')

                # 🔍 Find order by session_id
                order = Order.query.filter_by(stripe_payment_id=session_id).first()
                if not order:
                    return {"message": "Order not found"}, 404

                if order.status == "paid":
                    return {"message": "Order already marked as paid"}, 200

                # ✅ Update order
                order.status = "paid"
                order.paid_at = datetime.utcnow()

                # 🧹 Clear buyer's cart (only the purchased products)
                product_ids = [item.product_id for item in order.items]
                CartItem.query.filter(
                    CartItem.buyer_id == order.buyer_id,
                    CartItem.product_id.in_(product_ids)
                ).delete(synchronize_session=False)

                # 💸 Calculate and create payouts
                seller_earnings = {}
                for item in order.items:
                    product = Product.query.get(item.product_id)
                    if not product:
                        continue
                    seller_id = product.seller_id
                    seller_earnings[seller_id] = seller_earnings.get(seller_id, 0) + item.price

                for seller_id, gross_amount in seller_earnings.items():
                    platform_fee = round(gross_amount * 0.10, 2)
                    net_amount = round(gross_amount - platform_fee, 2)

                    # Avoid duplicate payouts
                    existing_payout = Payout.query.filter_by(
                        seller_id=seller_id,
                        amount=net_amount,
                        status="paid"
                    ).first()

                    if not existing_payout:
                        payout = Payout(
                            seller_id=seller_id,
                            amount=net_amount,
                            status="paid",
                            date=datetime.utcnow()
                        )
                        db.session.add(payout)

                db.session.commit()
                return {"message": "Order marked as paid, payouts created, and cart cleared"}, 200

            except Exception as e:
                db.session.rollback()
                return {"message": f"Processing error: {str(e)}"}, 500

        return {"message": "Unhandled event type"}, 200
