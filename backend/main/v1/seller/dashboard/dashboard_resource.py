from flask_restful import Resource
from main.common.jwt_utils import token_required
from main.database.models import db, Product, OrderItem, Order, Payout
from sqlalchemy import func

class SellerDashboardResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "seller":
            return {
                "code": 403,
                "message": "Only sellers can access the dashboard",
                "status": 0
            }, 403

        try:
            # Total active products listed by seller (excluding deleted)
            product_count = Product.query.filter_by(seller_id=user_id, is_deleted=False).count()

            # Total earnings and units sold (only for paid orders & active products)
            sales_agg = (
                db.session.query(
                    func.sum(OrderItem.price * OrderItem.quantity).label("total_earned"),
                    func.sum(OrderItem.quantity).label("total_units_sold")
                )
                .join(Product, Product.id == OrderItem.product_id)
                .join(Order, Order.id == OrderItem.order_id)
                .filter(
                    Product.seller_id == user_id,
                    Product.is_deleted == False,
                    Order.status == "paid"
                )
                .first()
            )

            total_earned = round(float(sales_agg.total_earned or 0.0), 2)
            total_units_sold = int(sales_agg.total_units_sold or 0)

            # Payouts
            total_paid = round(
                db.session.query(func.sum(Payout.amount))
                .filter_by(seller_id=user_id, status="paid")
                .scalar() or 0.0, 2
            )

            total_pending = round(
                db.session.query(func.sum(Payout.amount))
                .filter_by(seller_id=user_id, status="pending")
                .scalar() or 0.0, 2
            )

            # Recent product sales (from paid orders and non-deleted products)
            order_items = (
                db.session.query(OrderItem)
                .join(Order, Order.id == OrderItem.order_id)
                .join(Product, Product.id == OrderItem.product_id)
                .filter(
                    Product.seller_id == user_id,
                    Product.is_deleted == False,
                    Order.status == "paid"
                )
                .order_by(Order.created_at.desc())
                .all()
            )

            recent_sales = {}
            for item in order_items:
                pid = item.product_id
                if pid not in recent_sales and len(recent_sales) < 5:
                    recent_sales[pid] = {
                        "product_id": pid,
                        "title": item.product.title,
                        "units_sold": 0,
                        "revenue": 0.0,
                    }
                if pid in recent_sales:
                    recent_sales[pid]["units_sold"] += item.quantity
                    recent_sales[pid]["revenue"] += item.price * item.quantity

            for sale in recent_sales.values():
                sale["revenue"] = round(sale["revenue"], 2)

            return {
                "code": 200,
                "status": 1,
                "data": {
                    "summary": {
                        "total_products": product_count,
                        "total_units_sold": total_units_sold,
                        "total_earned": total_earned,
                        "total_paid_out": total_paid,
                        "pending_payout": total_pending
                    },
                    "recent_product_sales": list(recent_sales.values())
                }
            }, 200

        except Exception as e:
            return {
                "code": 500,
                "status": 0,
                "message": f"Failed to load dashboard: {str(e)}"
            }, 500
