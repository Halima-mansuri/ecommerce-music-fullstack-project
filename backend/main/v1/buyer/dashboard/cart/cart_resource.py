from flask import request 
from flask_restful import Resource
from main.database.models import db, CartItem, Product, Coupon
from main.common.jwt_utils import token_required
from datetime import datetime

class AddToCartResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can add to cart", "status": 0}, 403

        data = request.get_json() or {}
        product_id = data.get("product_id")

        if not product_id:
            return {"code": 400, "message": "Product ID is required", "status": 0}, 400

        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            return {"code": 404, "message": "Product not found or has been removed", "status": 0}, 404

        existing_item = CartItem.query.filter_by(buyer_id=user_id, product_id=product_id).first()
        if existing_item:
            return {"code": 400, "message": "Product already in cart", "status": 0}, 400

        new_item = CartItem(buyer_id=user_id, product_id=product_id)
        db.session.add(new_item)

        try:
            db.session.commit()
            return {"code": 201, "message": "Item added to cart", "status": 1}, 201
        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Failed to add item: {str(e)}", "status": 0}, 500

class ViewCartResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can view cart", "status": 0}, 403

        items = CartItem.query.filter_by(buyer_id=user_id).all()
        result = []
        for item in items:
            product = Product.query.get(item.product_id)
            if not product or product.is_deleted:
                continue  

            valid_coupons = Coupon.query.filter(
                Coupon.product_id == product.id,
                Coupon.valid_until >= datetime.utcnow()
            ).all()

            coupons_data = [
                {
                    "code": c.code,
                    "discount_percent": c.discount_percent,
                    "valid_until": c.valid_until.isoformat()
                } for c in valid_coupons
            ]

            result.append({
                "product_id": product.id,
                "title": product.title,
                "price": product.price,
                "coupons": coupons_data
            })

        return {
            "code": 200,
            "data": result,
            "status": 1
        }, 200

class RemoveCartItemResource(Resource):
    @token_required
    def delete(self, user_id, role, product_id):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can remove from cart", "status": 0}, 403

        item = CartItem.query.filter_by(buyer_id=user_id, product_id=product_id).first()
        if not item:
            return {"code": 404, "message": "Item not found in cart", "status": 0}, 404

        try:
            db.session.delete(item)
            db.session.commit()
            return {"code": 200, "message": "Item removed from cart", "status": 1}, 200
        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Failed to remove item: {str(e)}", "status": 0}, 500

class CartCountResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can view cart count", "status": 0}, 403

        count = CartItem.query.filter_by(buyer_id=user_id).count()
        return {
            "code": 200,
            "count": count,
            "status": 1
        }, 200
