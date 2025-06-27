import os
from dotenv import load_dotenv
load_dotenv()  # Load .env file

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your-default-secret-key")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-jwt-secret-key")

    # Get the raw DB URL and patch if needed
    raw_db_url = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:Mysql!server@localhost:3306/ecommerce_db"
    )

    if raw_db_url.startswith("mysql://"):
        raw_db_url = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)

    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Stripe Keys
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

    # Uploads
    UPLOAD_FOLDER = os.path.join(basedir, "uploads")
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB for development 
    # MAX_CONTENT_LENGTH = 30 * 1024 * 1024  # 30 MB for render free plan 

    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")



# import os
# from dotenv import load_dotenv
# load_dotenv()  

# basedir = os.path.abspath(os.path.dirname(__file__))

# class Config:
#     SECRET_KEY = os.environ.get("SECRET_KEY", "your-default-secret-key")

#     SQLALCHEMY_DATABASE_URI = os.environ.get(
#         "DATABASE_URL",
#         "mysql+pymysql://root:Mysql!server@localhost:3306/ecommerce_db"
#     )
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

#     STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
#     STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")
#     STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")  

#     JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-jwt-secret-key")

#     UPLOAD_FOLDER = os.path.join(basedir, "uploads")
#     MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB limit

#     CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
#     CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
#     CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

