from flask_restful import Resource
from main.database.models import Report, Product, User
from main.common.jwt_utils import token_required

class AdminReportListResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != 'admin':
            return {"code": 403, "status": 0, "message": "Admin access required"}, 403

        reports = Report.query.order_by(Report.timestamp.desc()).all()
        report_list = []

        for r in reports:
            report_list.append({
                "report_id": r.id,
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "reason": r.reason,
                "reporter": {
                    "id": r.reporter.id,
                    "name": r.reporter.name,
                    "email": r.reporter.email
                },
                "reported_user": {
                    "id": r.reported_user.id,
                    "name": r.reported_user.name,
                    "email": r.reported_user.email
                } if r.reported_user else None,
                "reported_product": {
                    "id": r.product.id,
                    "title": r.product.title,
                    "price": r.product.price
                } if r.product else None
            })

        return {
            "code": 200,
            "status": 1,
            "message": "Report list fetched successfully",
            "data": report_list
        }, 200
