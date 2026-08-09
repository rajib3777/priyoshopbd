"""
PriyoShop URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Django Admin (emergency access only)
    path('django-admin/', admin.site.urls),

    # API v1
    path('api/v1/', include([
        # Auth
        path('auth/', include('apps.accounts.urls')),
        # Catalog
        path('categories/', include('apps.categories.urls')),
        path('brands/', include('apps.catalog.urls')),
        path('products/', include('apps.products.urls')),
        # Shopping
        path('cart/', include('apps.cart.urls')),
        path('wishlist/', include('apps.wishlist.urls')),
        path('checkout/', include('apps.checkout.urls')),
        # Orders
        path('orders/', include('apps.orders.urls')),
        path('returns/', include('apps.returns.urls')),
        # Customers
        path('customers/', include('apps.customers.urls')),
        # Promotions
        path('coupons/', include('apps.coupons.urls')),
        path('promotions/', include('apps.promotions.urls')),
        # Reviews
        path('reviews/', include('apps.reviews.urls')),
        # Shipping
        path('shipping/', include('apps.shipping.urls')),
        # Notifications
        path('notifications/', include('apps.notifications.urls')),
        # Content
        path('cms/', include('apps.cms.urls')),
        path('homepage/', include('apps.homepage.urls')),
        # Settings
        path('settings/', include('apps.settings_manager.urls')),
        path('tracking/', include('apps.tracking.urls')),
        # Admin APIs
        path('admin/', include([
            path('analytics/', include('apps.analytics.urls')),
            path('reports/', include('apps.reports.urls')),
            path('audit/', include('apps.audit.urls')),
            path('marketing/', include('apps.marketing.urls')),
            path('inventory/', include('apps.inventory.urls')),
        ])),
        # Health
        path('health/', include('apps.health.urls')),
        # API Docs
        path('schema/', SpectacularAPIView.as_view(), name='schema'),
        path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
