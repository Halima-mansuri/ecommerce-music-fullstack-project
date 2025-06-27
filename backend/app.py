from gevent import monkey
monkey.patch_all()  # This must come first

from main import create_app
from main.extension import socketio  # Initialized SocketIO
import main.socketio_setup  # Ensure your socket events are registered

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000, host="0.0.0.0")

