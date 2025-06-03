import cloudinary
import cloudinary.uploader
import cloudinary.api

def init_cloudinary(app):
    cloudinary.config(
        cloud_name=app.config["CLOUDINARY_CLOUD_NAME"],
        api_key=app.config["CLOUDINARY_API_KEY"],
        api_secret=app.config["CLOUDINARY_API_SECRET"],
        secure=True
    )
    
def upload_to_cloudinary(file, folder="products"):
    result = cloudinary.uploader.upload(file, folder=folder, resource_type="auto")
    return result.get("secure_url")