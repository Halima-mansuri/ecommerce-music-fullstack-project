from flask_restful import Resource
from flask import request
from sqlalchemy import func
from main.database.models import db, Product, OrderItem, Order
from main.common.jwt_utils import token_required

class SellerAllSalesResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can view sales", "status": 0}, 403

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        query = (
            db.session.query(
                OrderItem.product_id,
                Product.title,
                func.sum(OrderItem.quantity).label("total_units_sold"),
                func.sum(OrderItem.price * OrderItem.quantity).label("total_earned")
            )
            .join(Product, Product.id == OrderItem.product_id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                Product.seller_id == user_id,
                Product.is_deleted == False,
                Order.status == "paid"
            )
            .group_by(OrderItem.product_id, Product.title)
            .order_by(func.sum(OrderItem.quantity).desc())
        )

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        sales_data = [{
            "product_id": row.product_id,
            "title": row.title,
            "total_units_sold": int(row.total_units_sold or 0),
            "total_earned": round(float(row.total_earned or 0.0), 2)
        } for row in paginated.items]

        return {
            "code": 200,
            "status": 1,
            "data": sales_data,
            "pagination": {
                "page": paginated.page,
                "per_page": paginated.per_page,
                "total_pages": paginated.pages,
                "total_items": paginated.total
            }
        }, 200


class SellerProductSalesResource(Resource):
    @token_required
    def get(self, user_id, role, product_id):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can view product sales", "status": 0}, 403

        product = Product.query.filter_by(id=product_id, seller_id=user_id, is_deleted=False).first()
        if not product:
            return {"code": 404, "message": "Product not found or unauthorized", "status": 0}, 404

        result = (
            db.session.query(
                func.sum(OrderItem.quantity).label("total_units_sold"),
                func.sum(OrderItem.price * OrderItem.quantity).label("total_earned")
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                Product.id == product_id,
                Product.seller_id == user_id,
                Product.is_deleted == False,
                Order.status == "paid"
            )
            .first()
        )

        return {
            "code": 200,
            "status": 1,
            "data": {
                "product_id": product.id,
                "title": product.title,
                "total_units_sold": int(result.total_units_sold or 0),
                "total_earned": round(float(result.total_earned or 0.0), 2)
            }
        }, 200
