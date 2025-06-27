from flask import request
from flask_restful import Resource
from main.extension import db
from main.database.models import Wishlist, Product
from main.common.jwt_utils import token_required
from datetime import datetime

class WishlistResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "buyer":
            return {"code": 403, "message": "Only buyers can view wishlist", "status": 0}, 403

        wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()

        data = [{
            "wishlist_id": item.id,
            "product_id": item.product.id,
            "title": item.product.title,
            "price": item.product.price,
            "added_at": item.added_at.isoformat(),
            "preview_image_url": item.product.preview_image_url  # ✅ clear naming
        } for item in wishlist_items]

        return {"code": 200, "status": 1, "data": data}, 200

    @token_required
    def post(self, user_id, role):
        if role != "buyer":
            return {"code": 403, "message": "Only buyers can add to wishlist", "status": 0}, 403

        data = request.get_json() or {}
        product_id = data.get("product_id")

        if not product_id:
            return {"code": 400, "message": "product_id is required", "status": 0}, 400

        product = Product.query.get(product_id)
        if not product or product.is_deleted:
            return {"code": 404, "message": "Product not found", "status": 0}, 404

        existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
        if existing:
            return {"code": 409, "message": "Product already in wishlist", "status": 0}, 409

        new_item = Wishlist(user_id=user_id, product_id=product_id)
        db.session.add(new_item)
        db.session.commit()

        return {"code": 201, "message": "Added to wishlist", "status": 1}, 201

    @token_required
    def delete(self, user_id, role):
        if role != "buyer":
            return {"code": 403, "message": "Only buyers can remove from wishlist", "status": 0}, 403

        data = request.get_json() or {}
        product_id = data.get("product_id")

        if not product_id:
            return {"code": 400, "message": "product_id is required", "status": 0}, 400

        wishlist_item = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
        if not wishlist_item:
            return {"code": 404, "message": "Wishlist item not found", "status": 0}, 404

        db.session.delete(wishlist_item)
        db.session.commit()
        return {"code": 200, "message": "Removed from wishlist", "status": 1}, 200


class WishlistCountResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "buyer":
            return {"code": 403, "message": "Only buyers can view wishlist count", "status": 0}, 403

        count = Wishlist.query.filter_by(user_id=user_id).count()
        return {"code": 200, "status": 1, "count": count}, 200
