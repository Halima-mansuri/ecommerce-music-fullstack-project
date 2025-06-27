from main.extension import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'buyer' or 'seller' or 'admin'

    # Seller-specific fields
    store_name = db.Column(db.String(100), nullable=True)
    stripe_account_id = db.Column(db.String(100), nullable=True)  
    is_approved = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)  # for blocking users
    is_deleted = db.Column(db.Boolean, default=False)  # for soft deletion

    # products = db.relationship('Product', backref='seller', lazy=True)
    # orders = db.relationship('Order', backref='buyer', lazy=True)
    # downloads = db.relationship('DownloadHistory', backref='user', lazy=True)
    # payouts = db.relationship('Payout', backref='seller', lazy=True)
    # search_history = db.relationship('SearchHistory', backref='user', lazy=True)
    # search_history = db.relationship('SearchHistory', backref='user', lazy=True, cascade='all, delete-orphan', passive_deletes=True)
    
    # Relationships with cascading delete
    products = db.relationship('Product', backref='seller', lazy=True,cascade='all, delete-orphan', passive_deletes=True)
    orders = db.relationship('Order', backref='buyer', lazy=True,cascade='all, delete-orphan', passive_deletes=True)
    downloads = db.relationship('DownloadHistory', backref='user', lazy=True,cascade='all, delete-orphan', passive_deletes=True)
    payouts = db.relationship('Payout', backref='seller', lazy=True,cascade='all, delete-orphan', passive_deletes=True)
    search_history = db.relationship('SearchHistory', backref='user', lazy=True,cascade='all, delete-orphan', passive_deletes=True)
    reviews = db.relationship("Review",back_populates="user", cascade="all, delete-orphan")
    wishlist_items = db.relationship('Wishlist',backref='user',lazy=True,cascade='all, delete-orphan',passive_deletes=True)


class SearchHistory(db.Model):
    __tablename__ = 'search_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    query = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=True)  # e.g., 'Royalty-Free Music', 'Sound Effects'
    file_url = db.Column(db.String(255), nullable=False)  
    preview_image_url = db.Column(db.String(255), nullable=True)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

    # Audio-specific fields
    genre = db.Column(db.String(100), nullable=True)  # e.g., Ambient, Rock, Cinematic
    duration = db.Column(db.String(20), nullable=True)  # e.g., "2:34"
    audio_format = db.Column(db.String(20), nullable=True)  # e.g., 'MP3', 'WAV','OGG'
    bpm = db.Column(db.Integer, nullable=True)  # Beats per minute (for music use cases)
    license_type = db.Column(db.String(100), nullable=True)  # e.g., 'Royalty-Free', 'Creative Commons'

    preview_url = db.Column(db.String(255), nullable=True)  # MP3 preview URL

    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    coupons = db.relationship('Coupon', backref='product', lazy=True, cascade='all, delete-orphan', passive_deletes=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    downloads = db.relationship('DownloadHistory', backref='product', lazy=True)

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)

    product = db.relationship('Product', backref='cart_items', lazy=True)

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # 'stripe'
    stripe_payment_id = db.Column(db.String(100), nullable=True)  # Store Stripe payment intent ID
    status = db.Column(db.String(50), default='paid')  # 'paid', 'failed', etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)  # Final price after discount if any

class Coupon(db.Model):
    __tablename__ = 'coupons'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_percent = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    valid_until = db.Column(db.DateTime, nullable=False)

    def is_valid(self):
        return datetime.utcnow() <= self.valid_until

class DownloadHistory(db.Model):
    __tablename__ = 'download_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id'), nullable=False)
    download_time = db.Column(db.DateTime, default=datetime.utcnow)

    order_item = db.relationship('OrderItem', backref='downloads', lazy=True)

class Payout(db.Model):
    __tablename__ = 'payouts'

    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    # platform_fee = db.Column(db.Float, nullable=False, default=0.0)
    # net_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')  # 'pending', 'paid'
    date = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User',back_populates="reviews", lazy=True)
    product = db.relationship('Product', backref='reviews', lazy=True)

class Wishlist(db.Model):
    __tablename__ = 'wishlists'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # user = db.relationship('User', backref='wishlist_items', lazy=True)
    product = db.relationship('Product', backref='wishlisted_by', lazy=True)

    __table_args__ = (db.UniqueConstraint('user_id', 'product_id', name='unique_user_product_wishlist'),)

class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reported_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    # reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # reported_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    reason = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    reporter = db.relationship('User', foreign_keys=[reporter_id], backref='reports_made')
    reported_user = db.relationship('User', foreign_keys=[reported_user_id], backref='reports_received')
    product = db.relationship('Product', backref='reports')

    __table_args__ = (
            db.UniqueConstraint('reporter_id', 'product_id', name='unique_report_per_product'),
            db.UniqueConstraint('reporter_id', 'reported_user_id', name='unique_report_per_user'),
        )

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    # Relationships (optional, for ORM access if needed)
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')
