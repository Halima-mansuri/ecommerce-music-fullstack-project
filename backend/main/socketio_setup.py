# main/socketio_setup.py
from flask_socketio import SocketIO, emit, join_room, leave_room
from main.common.jwt_utils import decode_token
from main.extension import socketio
from datetime import datetime
from flask import request

online_users = {}  # user_id -> socket_id

def get_user_id_from_token(token):
    try:
        decoded = decode_token(token)
        return decoded.get("sub")
    except:
        return None

@socketio.on("connect")
def handle_connect():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id = get_user_id_from_token(token)
    if user_id:
        online_users[user_id] = request.sid
        join_room(user_id)
        emit("online_users", list(online_users.keys()), broadcast=True)

@socketio.on("disconnect")
def handle_disconnect():
    for uid, sid in list(online_users.items()):
        if sid == request.sid:
            del online_users[uid]
            break
    emit("online_users", list(online_users.keys()), broadcast=True)

@socketio.on("send_message")
def handle_send_message(data):
    receiver_id = data.get("receiver_id")
    message = data.get("message")
    emit("receive_message", {
        "sender_id": get_user_id_from_token(request.headers.get("Authorization", "").replace("Bearer ", "")),
        "receiver_id": receiver_id,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
    }, room=receiver_id)

@socketio.on("typing")
def handle_typing(data):
    emit("typing", {"from": get_user_id_from_token(request.headers.get("Authorization", "").replace("Bearer ", ""))}, room=data.get("receiver_id"))

@socketio.on("stop_typing")
def handle_stop_typing(data):
    emit("stop_typing", {"from": get_user_id_from_token(request.headers.get("Authorization", "").replace("Bearer ", ""))}, room=data.get("receiver_id"))
