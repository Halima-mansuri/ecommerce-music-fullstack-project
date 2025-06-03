import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from main.extension import db
from main.config.config import Config
from main.extension import init_extensions
from main.config.routes import register_routes
from main.common.cloudinary_helper import init_cloudinary

load_dotenv()  

def create_app():
    app = Flask(__name__, static_folder=None)  # Disable default static folder
    
    app.config.from_object(Config)

    CORS(app)

    init_extensions(app)
    init_cloudinary(app)  

    register_routes(app)

    # Create DB tables
    with app.app_context():
        db.create_all()

    # --- React static files config ---

    # Absolute path to your React build folder
    frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend'))
    dist_folder = os.path.join(frontend_folder, 'dist')

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_react(path):
        # List of all API prefixes you use
        api_prefixes = (
            "auth/",
            "seller/",
            "buyer/",
            "stripe/",
            # add other prefixes if any
        )

        # If path starts with any of the API prefixes, return 404 here to let Flask handle it normally
        if any(path.startswith(prefix) for prefix in api_prefixes):
            return "Not Found", 404

        # Try to serve static files from dist folder (js, css, images, etc.)
        file_path = os.path.join(dist_folder, path)
        if path != "" and os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(dist_folder, path)

        # Otherwise serve index.html for React routing to handle
        return send_from_directory(dist_folder, "index.html")

    return app
