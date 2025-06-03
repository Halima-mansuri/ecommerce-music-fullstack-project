import os
import tempfile
from flask import request
from flask_restful import Resource
from werkzeug.utils import secure_filename
from main.common.jwt_utils import token_required
from main.common.cloudinary_helper import upload_to_cloudinary
from main.common.audio_preview_generator import generate_30s_preview, detect_audio_format, detect_audio_duration, detect_bpm
from main.database.models import db, Product

class UploadProductResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can upload products", "status": 0}, 403

        title = request.form.get("title")
        description = request.form.get("description")
        price = request.form.get("price")
        file = request.files.get("file")

        if not all([title, description, price, file]):
            return {"code": 400, "message": "Missing required fields", "status": 0}, 400

        if not file.filename.lower().endswith(('.mp3', '.wav', '.ogg')):
            return {"code": 400, "message": "Invalid audio file format", "status": 0}, 400

        try:
            price = float(price)
        except ValueError:
            return {"code": 400, "message": "Invalid price format", "status": 0}, 400

        file.filename = secure_filename(file.filename)
        is_featured = request.form.get("is_featured", "false").lower() == "true"

        temp_input_path = None
        preview_path = None

        try:
            temp_input_path, preview_path, duration, bpm = generate_30s_preview(file)

            if not temp_input_path or not preview_path or not duration:
                return {"code": 500, "message": "Failed to generate preview or detect duration", "status": 0}, 500

            uploaded_url = upload_to_cloudinary(temp_input_path)
            preview_url = upload_to_cloudinary(preview_path)
            audio_format = detect_audio_format(temp_input_path)

            product = Product(
                title=title,
                description=description,
                price=price,
                file_url=uploaded_url,
                preview_url=preview_url,
                preview_image_url=request.form.get("preview_image_url"),
                category=request.form.get("category"),
                genre=request.form.get("genre"),
                duration=duration,
                audio_format=audio_format,
                bpm=bpm,
                license_type=request.form.get("license_type"),
                is_featured=is_featured,
                seller_id=user_id,
                is_deleted=False
            )

            db.session.add(product)
            db.session.commit()

            return {
                "code": 201,
                "message": "Product uploaded successfully",
                "status": 1,
                "product_id": product.id
            }, 201

        except Exception as e:
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Upload failed: {str(e)}",
                "status": 0
            }, 500

        finally:
            for path in [temp_input_path, preview_path]:
                if path and os.path.exists(path):
                    os.remove(path)

class SellerProductListResource(Resource):
    @token_required
    def get(self, user_id, role):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can view their products", "status": 0}, 403

        products = Product.query.filter_by(seller_id=user_id, is_deleted=False).all()
        product_list = [{
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "price": p.price,
            "category": p.category,
            "file_url": p.file_url,
            "preview_url": p.preview_url,
            "preview_image_url": p.preview_image_url,
            "genre": p.genre,
            "duration": p.duration,
            "audio_format": p.audio_format,
            "bpm": p.bpm,
            "license_type": p.license_type,
            "is_featured": p.is_featured,
            "created_at": p.created_at.isoformat() if p.created_at else None
        } for p in products]

        return {"code": 200, "status": 1, "data": product_list}, 200


class SellerSingleProductResource(Resource):
    @token_required
    def get(self, user_id, role, product_id):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can access their products", "status": 0}, 403

        product = Product.query.filter_by(id=product_id, seller_id=user_id, is_deleted=False).first()
        if not product:
            return {"code": 404, "message": "Product not found or unauthorized", "status": 0}, 404

        return {
            "code": 200,
            "status": 1,
            "data": {
                "id": product.id,
                "title": product.title,
                "description": product.description,
                "price": product.price,
                "category": product.category,
                "file_url": product.file_url,
                "preview_url": product.preview_url,
                "preview_image_url": product.preview_image_url,
                "genre": product.genre,
                "duration": product.duration,
                "audio_format": product.audio_format,
                "bpm": product.bpm,
                "license_type": product.license_type,
                "is_featured": product.is_featured,
                "created_at": product.created_at.isoformat() if product.created_at else None
            }
        }, 200

class ProductUpdateResource(Resource):
    @token_required
    def put(self, user_id, role, product_id):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can update products", "status": 0}, 403

        product = Product.query.filter_by(id=product_id, seller_id=user_id, is_deleted=False).first()
        if not product:
            return {"code": 404, "message": "Product not found or unauthorized", "status": 0}, 404

        if request.content_type.startswith('application/json'):
            data = request.get_json()
            file = None
        else:
            data = request.form
            file = request.files.get("file")

        temp_input_path = None
        preview_path = None

        try:
            if file:
                if not file.filename.lower().endswith(('.mp3', '.wav', '.ogg')):
                    return {"code": 400, "message": "Invalid audio file format", "status": 0}, 400

                file.filename = secure_filename(file.filename)
                temp_input_path, preview_path = generate_30s_preview(file)

                if not temp_input_path or not preview_path:
                    return {"code": 500, "message": "Failed to generate audio preview", "status": 0}, 500

                audio_format = detect_audio_format(temp_input_path)
                duration = detect_audio_duration(temp_input_path)
                bpm = detect_bpm(temp_input_path)

                product.audio_format = audio_format
                product.duration = duration
                product.bpm = bpm
                
                product.file_url = upload_to_cloudinary(temp_input_path)
                product.preview_url = upload_to_cloudinary(preview_path)

            updatable_fields = [
                "title", "description", "category", "preview_image_url",
                "genre", "duration", "audio_format", "bpm", "license_type"
            ]

            for field in updatable_fields:
                value = data.get(field)
                if value is not None:
                    setattr(product, field, value)

            if "price" in data:
                try:
                    product.price = float(data.get("price"))
                except ValueError:
                    return {"code": 400, "message": "Invalid price format", "status": 0}, 400

            if "is_featured" in data:
                product.is_featured = str(data.get("is_featured")).lower() == "true"

            db.session.commit()

            return {"code": 200, "message": "Product updated successfully", "status": 1}, 200

        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Update failed: {str(e)}", "status": 0}, 500

        finally:
            for path in [temp_input_path, preview_path]:
                if path and os.path.exists(path):
                    os.remove(path)

class ProductDeleteResource(Resource):
    @token_required
    def delete(self, user_id, role, product_id):
        if role != "seller":
            return {"code": 403, "message": "Only sellers can delete products", "status": 0}, 403

        product = Product.query.filter_by(id=product_id, seller_id=user_id, is_deleted=False).first()
        if not product:
            return {"code": 404, "message": "Product not found or unauthorized", "status": 0}, 404

        try:
            product.is_deleted = True
            db.session.commit()
            return {"code": 200, "message": "Product deleted successfully", "status": 1}, 200
        except Exception as e:
            db.session.rollback()
            return {"code": 500, "message": f"Deletion failed: {str(e)}", "status": 0}, 500
