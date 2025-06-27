from flask import request, jsonify, send_file
from flask_restful import Resource
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from datetime import datetime
from main.database.models import db, Order, OrderItem, Product, User, CartItem
from main.common.jwt_utils import token_required
from dotenv import load_dotenv
load_dotenv()
import stripe
import os

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

class BuyerOrdersResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "buyer":
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        orders = Order.query.filter_by(buyer_id=user_id).order_by(Order.created_at.desc()).all()
        data = []
        for order in orders:
            data.append({
                "order_id": order.id,
                "total_price": order.total_price,
                "status": order.status,
                "payment_method": order.payment_method,
                "created_at": order.created_at.isoformat(),
                "items": [
                    {
                        "product_id": item.product_id,
                        "product_title": item.product.title,
                        "price": item.price,
                        "quantity": item.quantity
                    } for item in order.items
                ]
            })

        return {"code": 200, "data": data, "status": 1}, 200


class BuyerOrderDetailResource(Resource):
    @token_required
    def get(self, user_id, role, order_id):
        if role != "buyer":
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        order = Order.query.filter_by(id=order_id, buyer_id=user_id).first()
        if not order:
            return {"code": 404, "message": "Order not found", "status": 0}, 404

        data = {
            "order_id": order.id,
            "total_price": order.total_price,
            "status": order.status,
            "payment_method": order.payment_method,
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "product_id": item.product_id,
                    "product_title": item.product.title,
                    "price": item.price,
                    "quantity": item.quantity
                } for item in order.items
            ]
        }

        return {"code": 200, "data": data, "status": 1}, 200

class BuyerOrderInvoiceResource(Resource):
    @token_required
    def get(self, user_id, role, order_id):
        if role != "buyer":
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        order = Order.query.filter_by(id=order_id, buyer_id=user_id, status="paid").first()
        if not order:
            return {"code": 404, "message": "Order not found", "status": 0}, 404

        buyer = User.query.get(order.buyer_id)

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        margin = 50
        y = height - margin
        line_height = 18

        def draw_header():
            nonlocal y
            # Colored header
            p.setFillColor(colors.HexColor("#6B46C1"))  # Purple
            p.rect(0, height - 60, width, 60, fill=1, stroke=0)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 20)
            p.drawString(margin, height - 40, "INVOICE")
            p.setFillColor(colors.black)
            y -= 80

        def draw_footer():
            p.setFont("Helvetica-Oblique", 10)
            p.setFillColor(colors.HexColor("#4A5568"))  # Gray
            p.drawCentredString(width / 2, 40, "Thank you for shopping with us!")
            p.setFillColor(colors.black)

        def new_page():
            nonlocal y
            p.showPage()
            draw_header()
            y = height - margin

        draw_header()

        # Invoice Metadata
        p.setFont("Helvetica", 12)
        p.drawString(margin, y, f"Invoice #: {order.id}")
        y -= line_height
        p.drawString(margin, y, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        y -= line_height
        p.drawString(margin, y, f"Buyer: {buyer.name} (ID: {buyer.id})")
        y -= line_height
        p.drawString(margin, y, f"Email: {buyer.email}")
        y -= line_height * 2

        # Table Header
        p.setFont("Helvetica-Bold", 12)
        p.setFillColor(colors.HexColor("#EDF2F7"))  # Light gray background
        p.rect(margin - 5, y - 5, width - 2 * margin + 10, line_height + 4, fill=1, stroke=0)
        p.setFillColor(colors.black)
        p.drawString(margin, y, "Item")
        p.drawString(margin + 200, y, "Price")
        p.drawString(margin + 300, y, "Qty")
        p.drawString(margin + 370, y, "Total")
        y -= line_height + 6

        p.setFont("Helvetica", 12)

        seller_info_set = set()

        for item in order.items:
            if y < 100:
                new_page()

            product = item.product
            total = item.price * item.quantity
            seller = product.seller

            # Draw product line
            p.drawString(margin, y, product.title)
            p.drawString(margin + 200, y, f"${item.price:.2f}")
            p.drawString(margin + 300, y, str(item.quantity))
            p.drawString(margin + 370, y, f"${total:.2f}")
            y -= line_height

            # Collect seller info
            seller_info_set.add((seller.name, seller.email, seller.store_name or "N/A"))

        # Total Summary
        if y < 120:
            new_page()

        y -= line_height
        p.line(margin, y + 6, width - margin, y + 6)
        y -= line_height

        p.setFont("Helvetica-Bold", 12)
        p.drawRightString(width - margin - 10, y, f"Total: ${order.total_price:.2f}")
        y -= line_height * 2

        # Seller Information Section (after table)
        p.setFont("Helvetica-Bold", 13)
        p.drawString(margin, y, "Seller Information")
        y -= line_height

        p.setFont("Helvetica", 11)
        for name, email, store in seller_info_set:
            if y < 80:
                new_page()
            p.drawString(margin, y, f"Name: {name}")
            y -= line_height
            p.drawString(margin, y, f"Email: {email}")
            y -= line_height
            p.drawString(margin, y, f"Store: {store}")
            y -= line_height * 2

        draw_footer()
        p.showPage()
        p.save()
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"invoice_order_{order.id}.pdf",
            mimetype="application/pdf"
        )

class BuyerCancelOrderResource(Resource):
    @token_required
    def delete(self, user_id, role, order_id):
        if role != 'buyer':
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        order = Order.query.filter_by(id=order_id, buyer_id=user_id).first()
        if not order:
            return {"code": 404, "message": "Order not found", "status": 0}, 404

        if order.status != 'pending':
            return {
                "code": 400,
                "message": f"Only 'pending' orders can be canceled. Current status: {order.status}",
                "status": 0
            }, 400

        try:
            order.status = 'cancelled'
            
            CartItem.query.filter_by(buyer_id=user_id).delete()

            db.session.commit()
            return {
                "code": 200,
                "message": "Order cancelled successfully",
                "status": 1
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Failed to cancel order: {str(e)}",
                "status": 0
            }, 500

class BuyerCancelPendingOrderResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        pending_order = Order.query.filter_by(buyer_id=user_id, status='pending').first()
        if not pending_order:
            return {"code": 404, "message": "No pending order found", "status": 0}, 404

        try:
            pending_order.status = 'cancelled'
            db.session.commit()
            return {
                "code": 200,
                "message": "Pending order cancelled successfully",
                "status": 1
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Failed to cancel pending order: {str(e)}",
                "status": 0
            }, 500

class BuyerRetryCheckoutResource(Resource):
    @token_required
    def post(self, user_id, role, order_id):
        if role != "buyer":
            return {"code": 403, "message": "Access denied", "status": 0}, 403

        # Retrieve the pending order
        order = Order.query.filter_by(id=order_id, buyer_id=user_id, status="pending").first()
        if not order:
            return {"code": 404, "message": "Pending order not found", "status": 0}, 404

        # Retrieve order items
        order_items = OrderItem.query.filter_by(order_id=order.id).all()
        if not order_items:
            return {"code": 400, "message": "No items found in the order", "status": 0}, 400

        # Prepare line items for Stripe checkout
        line_items = []
        order_total = 0
        seller_id = None

        for item in order_items:
            product = Product.query.get(item.product_id)
            if not product or product.is_deleted:
                continue

            if seller_id is None:
                seller_id = product.seller_id
            elif seller_id != product.seller_id:
                return {"code": 400, "message": "All products in the order must be from the same seller", "status": 0}, 400

            price = item.price
            order_total += price

            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": product.title},
                    "unit_amount": int(price * 100),
                },
                "quantity": item.quantity,
            })

        if not line_items:
            return {"code": 400, "message": "No valid products found in the order", "status": 0}, 400

        seller = User.query.get(seller_id)
        if not seller or not seller.stripe_account_id:
            return {"code": 400, "message": "Seller does not have a valid Stripe account", "status": 0}, 400

        try:
            # Create a new Stripe checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url="http://192.168.1.34:5000/payment/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url="http://192.168.1.34:5000/cart",
                payment_intent_data={
                    "application_fee_amount": int(order_total * 0.1 * 100),
                    "transfer_data": {
                        "destination": seller.stripe_account_id
                    }
                },
            )

            # Update the order with the new Stripe session ID
            order.stripe_payment_id = session.id
            db.session.commit()

            return {
                "code": 200,
                "message": "Checkout session recreated successfully",
                "checkout_url": session.url,
                "status": 1
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Failed to recreate checkout session: {str(e)}",
                "status": 0
            }, 500