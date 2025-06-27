from flask import request
from flask_restful import Resource
from main.extension import db
from main.database.models import Review, Product
from main.common.jwt_utils import token_required, decode_token
from datetime import datetime


class PostReviewResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can post reviews", "status": 0}, 403

        data = request.get_json() or {}
        product_id = data.get("product_id")
        rating = data.get("rating")
        comment = data.get("comment", "")

        if not product_id or not rating:
            return {"code": 400, "message": "product_id and rating are required", "status": 0}, 400

        product = Product.query.get(product_id)
        if not product:
            return {"code": 404, "message": "Product not found", "status": 0}, 404

        # Check if a review already exists for this user and product
        existing = Review.query.filter_by(user_id=user_id, product_id=product_id).first()

        if existing:
            # Update existing review
            existing.rating = rating
            existing.comment = comment
            existing.timestamp = datetime.utcnow()
            db.session.commit()
            return {"code": 200, "message": "Review updated successfully", "status": 1}, 200
        else:
            # Create new review
            review = Review(
                user_id=user_id,
                product_id=product_id,
                rating=rating,
                comment=comment,
                timestamp=datetime.utcnow()
            )
            db.session.add(review)
            db.session.commit()
            return {"code": 201, "message": "Review added successfully", "status": 1}, 201


class DeleteReviewResource(Resource):
    @token_required
    def delete(self, user_id, role, review_id):
        if role != 'buyer':
            return {"code": 403, "message": "Only buyers can delete reviews", "status": 0}, 403

        review = Review.query.filter_by(id=review_id, user_id=user_id).first()
        if not review:
            return {"code": 404, "message": "Review not found or not authorized", "status": 0}, 404

        db.session.delete(review)
        db.session.commit()
        return {"code": 200, "message": "Review deleted successfully", "status": 1}, 200


class ProductReviewListResource(Resource):
    def get(self, product_id):
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=5, type=int)

        # Extract user_id from Authorization header if present
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            decoded = decode_token(token)
            if decoded and 'user_id' in decoded:
                user_id = decoded['user_id']

        # Fetch the logged-in user's review separately (to always show on top of page 1)
        my_review = None
        if user_id:
            my_review_record = Review.query.filter_by(product_id=product_id, user_id=user_id).first()
            if my_review_record:
                my_review = {
                    "review_id": my_review_record.id,
                    "user_id": my_review_record.user_id,
                    "user": my_review_record.user.name,
                    "rating": my_review_record.rating,
                    "comment": my_review_record.comment,
                    "timestamp": my_review_record.timestamp.isoformat()
                }

        # Query other reviews excluding the logged-in user's review
        query = Review.query.filter(Review.product_id == product_id)
        if user_id:
            query = query.filter(Review.user_id != user_id)

        pagination = query.order_by(Review.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        reviews = [{
            "review_id": r.id,
            "user_id": r.user_id,
            "user": r.user.name,
            "rating": r.rating,
            "comment": r.comment,
            "timestamp": r.timestamp.isoformat()
        } for r in pagination.items]

        return {
            "code": 200,
            "status": 1,
            "my_review": my_review,  
            "data": reviews,        
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            }
        }, 200
