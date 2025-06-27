from flask import request
from flask_restful import Resource
from main.database.models import db, SearchHistory
from main.common.jwt_utils import token_required
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SearchHistoryResource(Resource):
    @token_required
    def post(self, user_id, role):
        if role != 'buyer':
            return {
                "code": 403,
                "message": "Only buyers can store search history",
                "status": 0
            }, 403

        data = request.get_json() or {}
        query = data.get("query", "").strip()

        if not query:
            return {
                "code": 400,
                "message": "Search query is required",
                "status": 0
            }, 400

        try:
            # Prevent logging duplicate consecutive queries
            latest_entry = db.session.query(SearchHistory) \
                                     .filter(SearchHistory.user_id == user_id) \
                                     .order_by(SearchHistory.timestamp.desc()) \
                                     .first()

            if latest_entry and latest_entry.query.lower() == query.lower():
                return {
                    "code": 200,
                    "message": "Duplicate query ignored",
                    "status": 1
                }, 200

            new_entry = SearchHistory(user_id=user_id, query=query)
            db.session.add(new_entry)
            db.session.commit()

            return {
                "code": 201,
                "message": "Search query saved successfully",
                "status": 1
            }, 201

        except Exception as e:
            logger.exception("Failed to save search history")
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Failed to save search history: {str(e)}",
                "status": 0
            }, 500

    @token_required
    def get(self, user_id, role):
        if role != 'buyer':
            return {
                "code": 403,
                "message": "Only buyers can view search history",
                "status": 0
            }, 403

        try:
            history_entries = db.session.query(SearchHistory) \
                                        .filter(SearchHistory.user_id == user_id) \
                                        .order_by(SearchHistory.timestamp.desc()) \
                                        .limit(20) \
                                        .all()

            data = [
                {
                    "query": entry.query,
                    "timestamp": entry.timestamp.isoformat()
                }
                for entry in history_entries
            ]

            return {
                "code": 200,
                "status": 1,
                "data": data
            }, 200

        except Exception as e:
            logger.exception("Failed to retrieve search history")
            return {
                "code": 500,
                "message": f"Error retrieving history: {str(e)}",
                "status": 0
            }, 500

    @token_required
    def delete(self, user_id, role):
        if role != 'buyer':
            return {
                "code": 403,
                "message": "Only buyers can delete search history",
                "status": 0
            }, 403

        try:
            deleted = db.session.query(SearchHistory) \
                                .filter(SearchHistory.user_id == user_id) \
                                .delete()

            db.session.commit()

            return {
                "code": 200,
                "message": f"{deleted} search history entries deleted",
                "status": 1
            }, 200

        except Exception as e:
            logger.exception("Failed to delete search history")
            db.session.rollback()
            return {
                "code": 500,
                "message": f"Failed to delete search history: {str(e)}",
                "status": 0
            }, 500
