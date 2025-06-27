from gevent import monkey
monkey.patch_all()

from main import create_app
from main.extension import socketio
import main.socketio_setup
import os

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # use Render's PORT or 5000 locally
    socketio.run(app, debug=False, port=port, host="0.0.0.0")


# from gevent import monkey
# monkey.patch_all()  # This must come first

# from main import create_app
# from main.extension import socketio  # Initialized SocketIO
# import main.socketio_setup  # Ensure your socket events are registered

# app = create_app()

# if __name__ == "__main__":
#     socketio.run(app, debug=True, port=5000, host="0.0.0.0")

