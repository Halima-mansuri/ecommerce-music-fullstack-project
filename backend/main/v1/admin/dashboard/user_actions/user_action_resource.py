from flask_restful import Resource
from flask import request
from main.extension import db
from main.database.models import User, DownloadHistory
from main.common.jwt_utils import token_required


class BlockUserResource(Resource):
    @token_required
    def post(self, user_id, role, target_user_id):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        user = User.query.get(target_user_id)
        if not user:
            return {"code": 404, "status": 0, "message": "User not found"}, 404

        user.is_active = False
        db.session.commit()
        return {
            "code": 200,
            "status": 1,
            "message": f"User {user.email} blocked successfully",
            "data": {"id": user.id, "is_active": user.is_active}
        }, 200


class UnblockUserResource(Resource):
    @token_required
    def post(self, user_id, role, target_user_id):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        user = User.query.get(target_user_id)
        if not user:
            return {"code": 404, "status": 0, "message": "User not found"}, 404

        user.is_active = True
        db.session.commit()
        return {
            "code": 200,
            "status": 1,
            "message": f"User {user.email} unblocked successfully",
            "data": {"id": user.id, "is_active": user.is_active}
        }, 200


class DeleteUserResource(Resource):
    @token_required
    def delete(self, user_id, role, target_user_id):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        user = User.query.get(target_user_id)
        if not user:
            return {"code": 404, "status": 0, "message": "User not found"}, 404

        user.is_deleted = True
        db.session.commit()
        return {
            "code": 200,
            "status": 1,
            "message": f"User {user.email} soft-deleted successfully",
            "data": {"id": user.id, "is_deleted": user.is_deleted}
        }, 200


class RecoverUserResource(Resource):
    @token_required
    def post(self, user_id, role, target_user_id):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        user = User.query.get(target_user_id)
        if not user:
            return {"code": 404, "status": 0, "message": "User not found"}, 404

        if not user.is_deleted:
            return {"code": 400, "status": 0, "message": "User is not deleted"}, 400

        user.is_deleted = False
        user.is_active = True  # Optional: Also activate user upon recovery
        db.session.commit()
        return {
            "code": 200,
            "status": 1,
            "message": f"User {user.email} recovered successfully",
            "data": {"id": user.id, "is_deleted": user.is_deleted, "is_active": user.is_active}
        }, 200

# class HardDeleteUserResource(Resource):
#     @token_required
#     def delete(self, user_id, role, target_user_id):
#         if role != 'admin':
#             return {"code": 403, "status": 0, "message": "Admin access required"}, 403

#         user = User.query.get(target_user_id)
#         if not user:
#             return {"code": 404, "status": 0, "message": "User not found"}, 404

#         db.session.delete(user)
#         db.session.commit()

#         return {
#             "code": 200,
#             "status": 1,
#             "message": f"User {user.email} permanently deleted",
#             "data": {"id": target_user_id}
#         }, 200
    
class HardDeleteUserResource(Resource):
    @token_required
    def delete(self, user_id, role, target_user_id):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        user = User.query.get(target_user_id)
        if not user:
            return {"code": 404, "status": 0, "message": "User not found"}, 404

        try:
            # Step 1: Delete dependent data related to user (adjust as needed for your DB schema)
            DownloadHistory.query.filter_by(user_id=target_user_id).delete()
            # Wishlist.query.filter_by(user_id=target_user_id).delete()
            # Report.query.filter_by(reported_by=target_user_id).delete()
            # Report.query.filter_by(user_id=target_user_id).delete()  # If they were also reported

            # Step 2: Delete user
            db.session.delete(user)
            db.session.commit()

            return {
                "code": 200,
                "status": 1,
                "message": f"User {user.email} permanently deleted",
                "data": {"id": target_user_id}
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "code": 500,
                "status": 0,
                "message": f"Error deleting user: {str(e)}"
            }, 500
    
class TrashCountResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        count = User.query.filter_by(is_deleted=True).count()
        return {
            "code": 200,
            "status": 1,
            "message": "Trash count retrieved successfully",
            "data": {"trash_count": count}
        }, 200