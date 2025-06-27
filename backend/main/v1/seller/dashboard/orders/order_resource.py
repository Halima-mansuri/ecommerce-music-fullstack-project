from flask_restful import Resource
from flask import request
from main.database.models import Order, OrderItem, Product, User
from main.extension import db
from main.common.jwt_utils import token_required

class SellerOrdersResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "seller":
            return {"code": 403, "message": "Unauthorized - seller access only", "status": 0}, 403

        seller = User.query.filter_by(id=user_id, role='seller').first()
        if not seller or not seller.is_approved:
            return {"code": 403, "message": "Seller is not approved by admin", "status": 0}, 403
        
        seller_products = Product.query.filter_by(seller_id=user_id).all()
        product_ids = [p.id for p in seller_products]

        order_items = (
            OrderItem.query
            .join(Order, Order.id == OrderItem.order_id)
            .filter(OrderItem.product_id.in_(product_ids), Order.status == "paid")
            .all()
        )

        orders_dict = {}
        for item in order_items:
            order_id = item.order_id
            if order_id not in orders_dict:
                order = item.order
                buyer = order.buyer
                orders_dict[order_id] = {
                    "order_id": order.id,
                    "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "total_price": order.total_price,
                    "buyer_name": buyer.name,
                    "buyer_email": buyer.email,
                    "products": []
                }
            product = item.product
            orders_dict[order_id]["products"].append({
                "product_id": product.id,
                "title": product.title,
                "price": item.price,
                "quantity": item.quantity
            })

        return {
            "code": 200,
            "data": list(orders_dict.values()),
            "message": "Seller order list fetched successfully",
            "status": 1
        }, 200


class SellerOrderDetailResource(Resource):
    @token_required
    def get(self, user_id, role, order_id):
        if role != "seller":
            return {"code": 403, "message": "Unauthorized - seller access only", "status": 0}, 403
        
        seller = User.query.filter_by(id=user_id, role='seller').first()
        if not seller or not seller.is_approved:
            return {"code": 403, "message": "Seller is not approved by admin", "status": 0}, 403
        
        seller_products = Product.query.filter_by(seller_id=user_id).all()
        product_ids = [p.id for p in seller_products]

        order_items = (
            OrderItem.query
            .join(Order, Order.id == OrderItem.order_id)
            .filter(OrderItem.order_id == order_id, OrderItem.product_id.in_(product_ids), Order.status == "paid")
            .all()
        )

        if not order_items:
            return {"code": 404, "message": "No matching items found for this order", "status": 0}, 404

        order = order_items[0].order
        buyer = order.buyer

        products_data = []
        for item in order_items:
            product = item.product
            products_data.append({
                "product_id": product.id,
                "title": product.title,
                "price": item.price,
                "quantity": item.quantity
            })

        return {
            "code": 200,
            "data": {
                "order_id": order.id,
                "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "total_price": order.total_price,
                "buyer_name": buyer.name,
                "buyer_email": buyer.email,
                "products": products_data
            },
            "message": "Seller order details fetched successfully",
            "status": 1
        }, 200
