from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()

def init_extensions(app):
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)  

