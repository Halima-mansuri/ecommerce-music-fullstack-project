from flask_restful import Resource, reqparse
from flask import request
from main.extension import db
from main.database.models import User
from main.common.jwt_utils import token_required  # Ensure only admin can access


class SellerListResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Unauthorized"}, 403

        # Get query param `deleted`
        deleted_param = request.args.get('deleted', 'false').lower()
        is_deleted = deleted_param == 'true'

        # Filter sellers with optional is_deleted
        sellers = User.query.filter_by(role='seller', is_deleted=is_deleted).all()

        data = [{
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "store_name": s.store_name,
            "stripe_account_id": s.stripe_account_id,
            "is_deleted": s.is_deleted,
            "is_active": s.is_active,
            "is_approved": s.is_approved
        } for s in sellers]

        return {
            "code": 200,
            "status": 1,
            "message": f"{'Deleted' if is_deleted else 'Active'} seller list fetched",
            "data": data
        }, 200


class BuyerListResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Unauthorized"}, 403

        # Get query param `deleted`
        deleted_param = request.args.get('deleted', 'false').lower()
        is_deleted = deleted_param == 'true'

        # Filter buyers with optional is_deleted
        buyers = User.query.filter_by(role='buyer', is_deleted=is_deleted).all()

        data = [{
            "id": b.id,
            "name": b.name,
            "email": b.email,
            "is_deleted": b.is_deleted,
            "is_active": b.is_active
        } for b in buyers]

        return {
            "code": 200,
            "status": 1,
            "message": f"{'Deleted' if is_deleted else 'Active'} buyer list fetched",
            "data": data
        }, 200
