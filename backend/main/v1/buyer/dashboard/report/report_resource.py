from flask import request
from flask_restful import Resource
from main.database.models import db, Report, Product, User
from main.common.jwt_utils import token_required
from datetime import datetime

class ReportResource(Resource):
    @token_required
    def post(self, user_id, role):
        data = request.get_json() or {}
        reason = data.get('reason')
        reported_user_id = data.get('reported_user_id')
        product_id = data.get('product_id')

        if not reason or (not reported_user_id and not product_id):
            return {"code": 400, "message": "Reason and reported entity required", "status": 0}, 400

        # Validate reported product (if provided)
        if product_id:
            product = Product.query.get(product_id)
            if not product:
                return {"code": 404, "message": "Reported product not found", "status": 0}, 404

            # Check for duplicate report on product
            existing_report = Report.query.filter_by(
                reporter_id=user_id,
                product_id=product_id
            ).first()
            if existing_report:
                return {"code": 409, "message": "You have already reported this product", "status": 0}, 409

        # Validate reported user (if provided)
        if reported_user_id:
            user = User.query.get(reported_user_id)
            if not user:
                return {"code": 404, "message": "Reported user not found", "status": 0}, 404

            # Check for duplicate report on user
            existing_report = Report.query.filter_by(
                reporter_id=user_id,
                reported_user_id=reported_user_id
            ).first()
            if existing_report:
                return {"code": 409, "message": "You have already reported this user", "status": 0}, 409

        # Create new report
        report = Report(
            reporter_id=user_id,
            reported_user_id=reported_user_id,
            product_id=product_id,
            reason=reason,
            timestamp=datetime.utcnow()
        )

        db.session.add(report)
        try:
            db.session.commit()
            return {"code": 201, "message": "Report submitted successfully", "status": 1}, 201
        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Failed to submit report: {str(e)}", "status": 0}, 500
