from flask import request
from flask_restful import Resource
from main.database.models import Product, Coupon
from main.extension import db
from datetime import datetime

class ProductListResource(Resource):
    def get(self):
        query = Product.query.filter_by(is_deleted=False)

        # Search by title
        search = request.args.get('q')
        if search:
            query = query.filter(Product.title.ilike(f"%{search}%"))

        # Category filter
        category = request.args.get('category')
        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))

        # Price range filters
        try:
            price_min = request.args.get('price_min')
            if price_min is not None:
                query = query.filter(Product.price >= float(price_min))

            price_max = request.args.get('price_max')
            if price_max is not None:
                query = query.filter(Product.price <= float(price_max))
        except ValueError:
            return {"code": 400, "message": "Invalid price filter value", "status": 0}, 400

        # Featured filter
        is_featured = request.args.get('is_featured')
        if is_featured == 'true':
            query = query.filter(Product.is_featured.is_(True))

        # Sort by newest
        products = query.order_by(Product.created_at.desc()).all()

        data = [{
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "category": p.category,
            "file_url": p.file_url,
            "preview_url": p.preview_url,
            "preview_image_url": p.preview_image_url,
            "genre": p.genre,
            "duration": p.duration,
            "audio_format": p.audio_format,
            "bpm": p.bpm,
            "license_type": p.license_type,
            "is_featured": p.is_featured,
            "created_at": p.created_at.isoformat() if p.created_at else None
        } for p in products]

        return {"code": 200, "status": 1, "data": data}, 200


class ProductDetailResource(Resource):
    def get(self, product_id):
        product = Product.query.filter_by(id=product_id, is_deleted=False).first()
        if not product:
            return {"code": 404, "message": "Product not found", "status": 0}, 404

        valid_coupons = Coupon.query.filter(
            Coupon.product_id == product.id,
            Coupon.valid_until >= datetime.utcnow()
        ).all()

        coupon_data = [{
            "code": c.code,
            "discount_percent": c.discount_percent,
            "valid_until": c.valid_until.isoformat() if c.valid_until else None
        } for c in valid_coupons]

        data = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "file_url": product.file_url,
            "preview_url": product.preview_url,
            "preview_image_url": product.preview_image_url,
            "genre": product.genre,
            "duration": product.duration,
            "audio_format": product.audio_format,
            "bpm": product.bpm,
            "license_type": product.license_type,
            "is_featured": product.is_featured,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "available_coupons": coupon_data
        }

        return {"code": 200, "status": 1, "data": data}, 200
