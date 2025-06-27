from flask_restful import Resource
from flask import request
from main.database.models import db, Message, User
from main.common.jwt_utils import token_required
from datetime import datetime
from main.extension import socketio  # Make sure this is imported

class ChatResource(Resource):
    @token_required
    def get(self, user_id, role, target_id):
        # Get chat history between logged in user and target
        messages = Message.query.filter(
            ((Message.sender_id == user_id) & (Message.receiver_id == target_id)) |
            ((Message.sender_id == target_id) & (Message.receiver_id == user_id))
        ).order_by(Message.timestamp.asc()).all()

        return {
            "status": 1,
            "code": 200,
            "data": [ {
                "id": m.id,
                "message": m.message,
                "sender_id": m.sender_id,
                "receiver_id": m.receiver_id,
                "timestamp": m.timestamp.isoformat()
            } for m in messages ]
        }, 200

    @token_required
    def post(self, user_id, role, target_id):
        data = request.get_json()
        message_text = data.get("message")
        if not message_text:
            return {"status": 0, "code": 400, "message": "Message is required"}, 400

        message = Message(
            sender_id=user_id,
            receiver_id=target_id,
            message=message_text,
            timestamp=datetime.utcnow()
        )
        db.session.add(message)
        try:
            db.session.commit()

            # ✅ Real-time emit to receiver room after saving message
            socketio.emit("receive_message", {
                "id": message.id,
                "message": message.message,
                "sender_id": message.sender_id,
                "receiver_id": message.receiver_id,
                "timestamp": message.timestamp.isoformat()
            }, room=str(target_id))  # Room name must be a string

            return {"status": 1, "code": 201, "message": "Message sent"}, 201
        except Exception as e:
            db.session.rollback()
            return {"status": 0, "code": 500, "message": str(e)}, 500
        
class MarkAsReadResource(Resource):
    @token_required
    def post(self, sender_id, user_id, role):
        # sender_id is from URL
        # user_id (current user) is from token

        unread_messages = Message.query.filter_by(
            sender_id=sender_id,
            receiver_id=user_id,
            is_read=False
        ).all()

        for msg in unread_messages:
            msg.is_read = True

        db.session.commit()
        return {
            "status": 1,
            "code": 200,
            "message": "Messages marked as read"
        }, 200
    
class StartChatResource(Resource):
    @token_required
    def post(self, user_id, role, seller_id):
        if user_id == seller_id:
            return {"status": 0, "code": 400, "message": "Cannot chat with yourself"}, 400

        if role != "buyer":
            return {"status": 0, "code": 403, "message": "Only buyers can start a chat"}, 403

        # ✅ Check if seller exists
        seller = User.query.get(seller_id)
        if not seller or seller.role != "seller":
            return {"status": 0, "code": 404, "message": "Seller not found"}, 404

        # ✅ Check if any chat messages exist between buyer and seller
        existing = Message.query.filter(
            ((Message.sender_id == user_id) & (Message.receiver_id == seller_id)) |
            ((Message.sender_id == seller_id) & (Message.receiver_id == user_id))
        ).first()

        if existing:
            return {
                "status": 1,
                "code": 200,
                "message": "Chat already exists",
                "data": {
                    "seller_id": seller.id,
                    "seller_name": seller.name
                }
            }, 200

        # ✅ If not exist, create a blank message (not counted unread)
        new_message = Message(
            sender_id=user_id,
            receiver_id=seller_id,
            message="",  # Blank starting message
            is_read=True
        )

        db.session.add(new_message)
        try:
            db.session.commit()
            return {
                "status": 1,
                "code": 201,
                "message": "Chat started",
                "data": {
                    "seller_id": seller.id,
                    "seller_name": seller.name
                }
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"status": 0, "code": 500, "message": str(e)}, 500