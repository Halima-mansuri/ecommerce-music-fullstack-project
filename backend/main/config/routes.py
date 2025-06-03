from flask_restful import Api
from main.common.auth.auth_resource import UserRegistrationResource, UserLoginResource, UserProfileResource
from main.v1.seller.dashboard.products.product_resource import UploadProductResource, SellerProductListResource, SellerSingleProductResource, ProductUpdateResource, ProductDeleteResource
from main.v1.buyer.dashboard.products.product_resource import ProductListResource, ProductDetailResource
from main.v1.buyer.dashboard.cart.cart_resource import AddToCartResource, ViewCartResource, RemoveCartItemResource
from main.v1.buyer.dashboard.checkout.checkout_resource import ApplyCouponResource, CheckoutResource
from main.v1.seller.dashboard.coupons.coupon_resource import SellerCouponResource, SellerCouponDetailResource
from main.v1.buyer.dashboard.coupons.coupon_resource import BuyerCouponResource
from main.v1.seller.dashboard.payouts.payout_resource import RecordPayoutResource, SellerPayoutsResource
from main.v1.buyer.dashboard.downloads.download_resource import BuyerDownloadListResource, BuyerDownloadFileResource
from main.v1.seller.dashboard.sales_report.sales_report_resource import SellerAllSalesResource, SellerProductSalesResource
from main.v1.seller.dashboard.dashboard_resource import SellerDashboardResource
from main.v1.seller.dashboard.orders.order_resource import SellerOrdersResource, SellerOrderDetailResource
from main.v1.buyer.dashboard.orders.order_resource import BuyerOrdersResource, BuyerOrderDetailResource, BuyerOrderInvoiceResource, BuyerCancelOrderResource, BuyerCancelPendingOrderResource
from main.common.stripe.webhook_resource import StripeWebhookResource
from main.v1.buyer.dashboard.cart.cart_resource import CartCountResource

def register_routes(app):
    
    api = Api(app)

    api.add_resource(StripeWebhookResource, "/stripe/webhook")

    # api.add_resource(FreesoundSearchResource, '/freesound/search')
    # api.add_resource(FreesoundDetailResource, '/freesound/sound/<int:sound_id>')

    # >>> Auth Resources for both <<<
    api.add_resource(UserRegistrationResource, '/auth/register')
    api.add_resource(UserLoginResource, '/auth/login')
    api.add_resource(UserProfileResource, '/auth/profile')

    # **** Sellers Product Resources ****
    api.add_resource(UploadProductResource, '/seller/products/upload')
    api.add_resource(SellerProductListResource, '/seller/products')
    api.add_resource(SellerSingleProductResource, '/seller/products/<int:product_id>')
    api.add_resource(ProductUpdateResource, '/seller/products/<int:product_id>')
    api.add_resource(ProductDeleteResource, '/seller/products/<int:product_id>')

    # Sellers Coupon Resources 
    api.add_resource(SellerCouponResource, '/seller/coupon')
    api.add_resource(SellerCouponDetailResource, '/seller/coupon/<int:coupon_id>')

    # Sellers Sales Resources 
    api.add_resource(SellerAllSalesResource, '/seller/sales')
    api.add_resource(SellerProductSalesResource, '/seller/sales/<int:product_id>')

    # Sellers Order Resources 
    api.add_resource(SellerOrdersResource, '/seller/order')
    api.add_resource(SellerOrderDetailResource, '/seller/order/<int:order_id>')

    # Sellers Dashboard Resource
    api.add_resource(SellerDashboardResource, '/seller/dashboard')

    # Sellers Payout Resources 
    api.add_resource(RecordPayoutResource, '/seller/payouts/record')
    api.add_resource(SellerPayoutsResource, '/seller/payouts')

    # **** Buyer Product Resources ****
    api.add_resource(ProductListResource, '/buyer/products')
    api.add_resource(ProductDetailResource, '/buyer/products/<int:product_id>')

    # Buyer Download Resources
    api.add_resource(BuyerDownloadListResource, '/buyer/downloads')
    api.add_resource(BuyerDownloadFileResource, '/buyer/download/<int:order_item_id>')

    # Buyer Cart Resources
    api.add_resource(AddToCartResource, '/buyer/cart/add')
    api.add_resource(ViewCartResource, '/buyer/cart')
    api.add_resource(RemoveCartItemResource, '/buyer/cart/<int:product_id>')
    api.add_resource(CartCountResource, '/buyer/cart/count')

    # Buyer Checkout Resources
    api.add_resource(ApplyCouponResource, '/buyer/apply-coupon')
    api.add_resource(CheckoutResource, '/buyer/checkout')
    # api.add_resource(PaymentSuccessResource, '/payment/success')

    # Buyer Check Coupon Resources
    api.add_resource(BuyerCouponResource, '/buyer/coupons')

    # Buyer Order Resources 
    api.add_resource(BuyerOrdersResource, '/buyer/order')
    api.add_resource(BuyerOrderDetailResource, '/buyer/order/<int:order_id>')
    api.add_resource(BuyerOrderInvoiceResource, '/buyer/order/<int:order_id>/invoice')
    api.add_resource(BuyerCancelOrderResource, '/buyer/order/<int:order_id>/cancel') 
    api.add_resource(BuyerCancelPendingOrderResource, '/buyer/order/cancel-pending')
