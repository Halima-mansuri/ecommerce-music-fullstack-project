from flask import request
from flask_restful import Resource
from datetime import datetime
from main.database.models import db, Product, Coupon, CartItem
from main.common.jwt_utils import token_required

class BuyerCouponResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can fetch coupons", "status": 0}, 403

        product_id = request.args.get("product_id")
        if not product_id:
            return {"code": 400, "message": "Product ID is required", "status": 0}, 400

        in_cart = CartItem.query.filter_by(buyer_id=user_id, product_id=product_id).first()
        if not in_cart:
            return {"code": 400, "message": "Add product to cart before checking coupons", "status": 0}, 400

        product = Product.query.get(product_id)
        if not product:
            return {"code": 404, "message": "Product not found", "status": 0}, 404

        coupons = Coupon.query.filter(
            Coupon.product_id == product.id,
            Coupon.valid_until >= datetime.utcnow()
        ).all()

        if not coupons:
            return {"code": 404, "message": "No valid coupons available", "status": 0}, 404

        result = []
        for coupon in coupons:
            result.append({
                "id": coupon.id,
                "code": coupon.code,
                "discount_percent": coupon.discount_percent,
                "valid_until": coupon.valid_until.strftime("%Y-%m-%d"),
                "product_id": coupon.product_id
            })

        return {"code": 200, "coupons": result, "status": 1}, 200
