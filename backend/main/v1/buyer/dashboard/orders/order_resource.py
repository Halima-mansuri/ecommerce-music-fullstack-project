from flask import request, jsonify, send_file
from flask_restful import Resource
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime
from main.database.models import db, Order, OrderItem, Product, User
from main.common.jwt_utils import token_required

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

        y = height - 50
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, y, f"Invoice for Order #{order.id}")
        y -= 30

        p.setFont("Helvetica", 12)
        p.drawString(50, y, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        y -= 20
        p.drawString(50, y, f"Buyer ID: {buyer.id}")
        y -= 20
        p.drawString(50, y, f"Buyer Email: {buyer.email}")
        y -= 30

        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Items Purchased:")
        y -= 20
        p.setFont("Helvetica", 12)

        for item in order.items:
            product = item.product
            seller = product.seller  

            lines = [
                f"Product: {product.title}",
                f"Seller Name: {seller.name}",
                f"Seller Email: {seller.email}",
                f"Seller Store: {seller.store_name or 'N/A'}",
                f"Price: ${item.price:.2f} x {item.quantity}"
            ]

            for line in lines:
                p.drawString(60, y, line)
                y -= 18
                if y < 60:
                    p.showPage()
                    y = height - 50

            y -= 10  

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, f"Total: ${order.total_price:.2f}")

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
