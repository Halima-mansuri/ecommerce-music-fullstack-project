from sqlalchemy import or_, desc, func
from main.common.jwt_utils import token_required
from main.extension import db
from main.database.models import User, Message
from flask_restful import Resource

class ChatListResource(Resource):
    @token_required
    def get(self, user_id, role):
        # Subquery to get latest message per conversation
        last_messages_subquery = (
            db.session.query(
                func.max(Message.id).label("max_id")
            )
            .filter(or_(
                Message.sender_id == user_id,
                Message.receiver_id == user_id
            ))
            .group_by(
                func.least(Message.sender_id, Message.receiver_id),
                func.greatest(Message.sender_id, Message.receiver_id)
            )
            .subquery()
        )

        # Get last message of each conversation
        last_messages = (
            db.session.query(Message)
            .join(last_messages_subquery, Message.id == last_messages_subquery.c.max_id)
            .order_by(desc(Message.timestamp))
            .all()
        )

        chat_list = []
        for msg in last_messages:
            other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
            other_user = User.query.get(other_user_id)

            if not other_user:
                continue

            # Count unread messages sent by other_user to current_user
            unread_count = Message.query.filter_by(
                sender_id=other_user_id,
                receiver_id=user_id,
                is_read=False
            ).count()

            chat_list.append({
                "user_id": other_user.id,
                "name": other_user.name,
                "role": other_user.role,
                "last_message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
                "unread_count": unread_count  # ✅ Added unread count
            })

        return {
            "status": 1,
            "code": 200,
            "data": chat_list
        }, 200
