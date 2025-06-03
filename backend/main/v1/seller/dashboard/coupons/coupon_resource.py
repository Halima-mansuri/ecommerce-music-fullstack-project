from flask import request, jsonify
from flask_restful import Resource
from datetime import datetime
from main.database.models import db, Product, Coupon
from main.common.jwt_utils import token_required

class SellerCouponResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'seller':
            return {"code": 403, "message": "Only sellers can create coupons", "status": 0}, 403

        data = request.get_json() or {}
        product_id = data.get("product_id")
        code = data.get("code")
        discount_percent = data.get("discount_percent")
        valid_until_str = data.get("valid_until")

        if not all([product_id, code, discount_percent, valid_until_str]):
            return {"code": 400, "message": "All fields are required", "status": 0}, 400

        try:
            valid_until = datetime.strptime(valid_until_str, "%Y-%m-%d")
        except ValueError:
            return {"code": 400, "message": "Invalid date format (expected YYYY-MM-DD)", "status": 0}, 400

        product = Product.query.get(product_id)
        if not product or product.seller_id != user_id:
            return {"code": 403, "message": "You can only add coupons to your own products", "status": 0}, 403

        existing_coupon = Coupon.query.filter_by(code=code).first()
        if existing_coupon:
            return {"code": 400, "message": "Coupon code already exists", "status": 0}, 400

        new_coupon = Coupon(
            code=code,
            discount_percent=discount_percent,
            product_id=product_id,
            valid_until=valid_until
        )
        db.session.add(new_coupon)
        db.session.commit()

        return {"code": 201, "message": "Coupon created successfully", "status": 1}, 201
    
    @token_required
    def get(self, user_id, role):
        if role != 'seller':
            return {"code": 403, "message": "Only sellers can view their coupons", "status": 0}, 403

        product_id = request.args.get("product_id")

        seller_products = Product.query.filter_by(seller_id=user_id).all()
        product_ids = [p.id for p in seller_products]

        if product_id:
            if int(product_id) not in product_ids:
                return {"code": 403, "message": "You can only view coupons for your own products", "status": 0}, 403
            coupons = Coupon.query.filter_by(product_id=product_id).all()
        else:
            coupons = Coupon.query.filter(Coupon.product_id.in_(product_ids)).all()

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

class SellerCouponDetailResource(Resource):
    @token_required
    def delete(self, user_id, role, coupon_id):
        if role != 'seller':
            return {"code": 403, "message": "Only sellers can delete coupons", "status": 0}, 403

        coupon = Coupon.query.get(coupon_id)
        if not coupon:
            return {"code": 404, "message": "Coupon not found", "status": 0}, 404

        product = Product.query.get(coupon.product_id)
        if product.seller_id != user_id:
            return {"code": 403, "message": "You can only delete your own coupons", "status": 0}, 403

        db.session.delete(coupon)
        db.session.commit()

        return {"code": 200, "message": "Coupon deleted successfully", "status": 1}, 200

    @token_required
    def put(self, user_id, role, coupon_id):
        if role != 'seller':
            return {"code": 403, "message": "Only sellers can update coupons", "status": 0}, 403

        data = request.get_json() or {}
        coupon = Coupon.query.get(coupon_id)
        if not coupon:
            return {"code": 404, "message": "Coupon not found", "status": 0}, 404

        product = Product.query.get(coupon.product_id)
        if product.seller_id != user_id:
            return {"code": 403, "message": "You can only update your own coupons", "status": 0}, 403

        code = data.get("code")
        discount_percent = data.get("discount_percent")
        valid_until = data.get("valid_until")

        if code:
            existing = Coupon.query.filter(Coupon.code == code, Coupon.id != coupon.id).first()
            if existing:
                return {"code": 400, "message": "Coupon code already exists", "status": 0}, 400
            coupon.code = code

        if discount_percent:
            try:
                coupon.discount_percent = int(discount_percent)
            except:
                return {"code": 400, "message": "Discount percent must be an integer", "status": 0}, 400

        if valid_until:
            try:
                coupon.valid_until = datetime.strptime(valid_until, "%Y-%m-%d")
            except:
                return {"code": 400, "message": "Invalid date format. Use YYYY-MM-DD", "status": 0}, 400

        db.session.commit()

        return {
            "code": 200,
            "message": "Coupon updated successfully",
            "coupon": {
                "id": coupon.id,
                "code": coupon.code,
                "discount_percent": coupon.discount_percent,
                "valid_until": coupon.valid_until.strftime("%Y-%m-%d"),
                "product_id": coupon.product_id
            },
            "status": 1
        }, 200
    
    @token_required
    def get(self, user_id, role, coupon_id):
        if role != 'seller':
            return {"code": 403, "message": "Only sellers can view a coupon", "status": 0}, 403

        coupon = Coupon.query.get(coupon_id)
        if not coupon:
            return {"code": 404, "message": "Coupon not found", "status": 0}, 404

        product = Product.query.get(coupon.product_id)
        if product.seller_id != user_id:
            return {"code": 403, "message": "You can only view your own coupons", "status": 0}, 403

        return {
            "code": 200,
            "coupon": {
                "id": coupon.id,
                "code": coupon.code,
                "discount_percent": coupon.discount_percent,
                "valid_until": coupon.valid_until.strftime("%Y-%m-%d"),
                "product_id": coupon.product_id
            },
            "status": 1
        }, 200
