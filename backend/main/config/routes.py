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
from main.v1.buyer.dashboard.orders.order_resource import BuyerOrdersResource, BuyerOrderDetailResource, BuyerOrderInvoiceResource, BuyerCancelOrderResource, BuyerCancelPendingOrderResource, BuyerRetryCheckoutResource
from main.common.stripe.webhook_resource import StripeWebhookResource
from main.v1.buyer.dashboard.cart.cart_resource import CartCountResource
from main.v1.buyer.dashboard.search.search_history import SearchHistoryResource
from main.v1.buyer.dashboard.reviews.review_resource import PostReviewResource, ProductReviewListResource, DeleteReviewResource
from main.v1.buyer.dashboard.wishlist.wishlist_resource import WishlistResource, WishlistCountResource
from main.v1.buyer.dashboard.report.report_resource import ReportResource
from main.v1.admin.dashboard.usersList.userlist_resource import SellerListResource, BuyerListResource
from main.v1.admin.dashboard.seller_approvel.seller_approvel_resource import ApproveSellerResource
from main.v1.admin.dashboard.reports.report_resource import AdminReportListResource
from main.v1.admin.dashboard.user_actions.user_action_resource import BlockUserResource, UnblockUserResource, DeleteUserResource, RecoverUserResource, HardDeleteUserResource, TrashCountResource
from main.chat_routes import ChatResource, MarkAsReadResource, StartChatResource
from main.chat_list import ChatListResource

def register_routes(app):
    
    api = Api(app)

    api.add_resource(StripeWebhookResource, "/stripe/webhook")

    # Chat Resource
    api.add_resource(ChatResource, '/chat/<int:target_id>')
    api.add_resource(ChatListResource, '/chat-list')
    api.add_resource(MarkAsReadResource, '/chat/<int:sender_id>/mark-read')
    api.add_resource(StartChatResource, '/chat/<int:seller_id>')


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

    # Buyer Wishlist Resources
    api.add_resource(WishlistResource, '/buyer/wishlist')
    api.add_resource(WishlistCountResource, '/buyer/wishlist/count') 

    # Buyer Report Resources
    api.add_resource(ReportResource, '/buyer/report')

    # Buyer Cart Resources
    api.add_resource(AddToCartResource, '/buyer/cart/add')
    api.add_resource(ViewCartResource, '/buyer/cart')
    api.add_resource(RemoveCartItemResource, '/buyer/cart/<int:product_id>')
    api.add_resource(CartCountResource, '/buyer/cart/count')

    # Buyer Review Resources 
    api.add_resource(PostReviewResource, "/review")
    api.add_resource(ProductReviewListResource, "/product/<int:product_id>/review")
    api.add_resource(DeleteReviewResource, '/review/<int:review_id>')

    # Buyer Checkout Resources
    api.add_resource(ApplyCouponResource, '/buyer/apply-coupon')
    api.add_resource(CheckoutResource, '/buyer/checkout')
    # api.add_resource(PaymentSuccessResource, '/payment/success')

    # Buyer Check Coupon Resources
    api.add_resource(BuyerCouponResource, '/buyer/coupons')

    # Buyer Search Resource
    api.add_resource(SearchHistoryResource, '/buyer/search-history')

    # Buyer Order Resources 
    api.add_resource(BuyerOrdersResource, '/buyer/order')
    api.add_resource(BuyerOrderDetailResource, '/buyer/order/<int:order_id>')
    api.add_resource(BuyerOrderInvoiceResource, '/buyer/order/<int:order_id>/invoice')
    api.add_resource(BuyerCancelOrderResource, '/buyer/order/<int:order_id>/cancel') 
    api.add_resource(BuyerCancelPendingOrderResource, '/buyer/order/cancel-pending')
    api.add_resource(BuyerRetryCheckoutResource, '/buyer/order/<int:order_id>/retry')

    # **** Admin UsersList Resources ****
    api.add_resource(SellerListResource, '/admin/sellers')
    api.add_resource(BuyerListResource, '/admin/buyers')

    # Admin Seller Approvel Resource
    api.add_resource(ApproveSellerResource, '/admin/approve-seller/<int:seller_id>')

    # Admin Reports Resource
    api.add_resource(AdminReportListResource, "/admin/reports")

    # Admin Block/UnBlock Resource
    api.add_resource(BlockUserResource, '/admin/users/<int:target_user_id>/block')
    api.add_resource(UnblockUserResource, '/admin/users/<int:target_user_id>/unblock')
    api.add_resource(DeleteUserResource, '/admin/users/<int:target_user_id>/delete')
    api.add_resource(RecoverUserResource, '/admin/users/<int:target_user_id>/recover')
    api.add_resource(HardDeleteUserResource, '/admin/users/<int:target_user_id>/hard-delete')
    api.add_resource(TrashCountResource, '/admin/users/trash-count')