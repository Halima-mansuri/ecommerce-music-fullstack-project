from flask_restful import Resource
from flask import request, send_file
from main.database.models import OrderItem, Order, Product, DownloadHistory
from main.common.jwt_utils import token_required
from main.extension import db
from io import BytesIO
import requests
import mimetypes
from datetime import datetime

MAX_DOWNLOADS_PER_PRODUCT = 3

class BuyerDownloadListResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "buyer":
            return {"code": 403, "message": "Unauthorized access", "status": 0}, 403

        order_items = OrderItem.query.join(Order).filter(
            Order.buyer_id == user_id,
            Order.status == "paid"
        ).all()

        downloads = []
        for item in order_items:
            product = Product.query.get(item.product_id)
            if not product:
                continue

            download_entries = DownloadHistory.query.filter_by(
                user_id=user_id,
                order_item_id=item.id
            ).order_by(DownloadHistory.download_time.desc()).all()

            download_count = len(download_entries)
            last_download_time = download_entries[0].download_time.isoformat() if download_entries else None

            downloads.append({
                "order_item_id": item.id,
                "product_id": product.id,
                "title": product.title,
                "file_url": product.file_url,
                "downloaded": download_count,
                "remaining_downloads": max(0, MAX_DOWNLOADS_PER_PRODUCT - download_count),
                "last_download_time": last_download_time
            })

        return {
            "code": 200,
            "message": "Downloadable products fetched",
            "status": 1,
            "downloads": downloads
        }, 200


class BuyerDownloadFileResource(Resource):
    @token_required
    def get(self, user_id, role, order_item_id):
        if role != "buyer":
            return {"code": 403, "message": "Unauthorized access", "status": 0}, 403

        item = OrderItem.query.join(Order).filter(
            OrderItem.id == order_item_id,
            Order.buyer_id == user_id,
            Order.status == "paid"
        ).first()

        if not item:
            return {"code": 403, "message": "You have not purchased this item", "status": 0}, 403

        product = Product.query.get(item.product_id)
        if not product or not product.file_url:
            return {"code": 404, "message": "File not found", "status": 0}, 404

        download_count = DownloadHistory.query.filter_by(
            user_id=user_id, order_item_id=order_item_id
        ).count()

        if download_count >= MAX_DOWNLOADS_PER_PRODUCT:
            return {
                "code": 403,
                "message": f"Download limit reached. Max allowed is {MAX_DOWNLOADS_PER_PRODUCT}",
                "status": 0
            }, 403

        try:
            response = requests.get(product.file_url, stream=True, timeout=10)
            if response.status_code != 200:
                return {"code": 500, "message": "Failed to retrieve file", "status": 0}, 500

            file_ext = product.file_url.split("?")[0].split(".")[-1].lower()
            if file_ext not in ["mp3", "wav", "ogg"]:
                return {"code": 400, "message": "Unsupported file format", "status": 0}, 400

            mime_type = mimetypes.types_map.get(f".{file_ext}", "application/octet-stream")
            filename = f"{product.title}.{file_ext}"

            # Log download attempt
            download = DownloadHistory(
                user_id=user_id,
                product_id=product.id,
                order_item_id=order_item_id,
                download_time=datetime.utcnow()
            )
            db.session.add(download)
            db.session.commit()

            file_like = BytesIO(response.content)
            file_like.seek(0)
            return send_file(
                file_like,
                as_attachment=True,
                download_name=filename,
                mimetype=mime_type
            )

        except Exception as e:
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Error downloading file: {str(e)}",
                "status": 0
            }, 500
