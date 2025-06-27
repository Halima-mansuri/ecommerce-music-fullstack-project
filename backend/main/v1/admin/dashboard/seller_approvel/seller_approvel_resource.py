from flask_restful import Resource
from flask import jsonify
from main.extension import db
from main.database.models import User
from main.common.jwt_utils import token_required

class ApproveSellerResource(Resource):
    @token_required
    def post(self, user_id, role, seller_id):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        seller = User.query.filter_by(id=seller_id, role='seller').first()
        if not seller:
            return {"code": 404, "status": 0, "message": "Seller not found"}, 404

        seller.is_approved = True
        db.session.commit()

        return {
            "code": 200,
            "status": 1,
            "message": f"Seller {seller.email} approved successfully",
            "data": {"id": seller.id, "is_approved": seller.is_approved}
        }, 200
