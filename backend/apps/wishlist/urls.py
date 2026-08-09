from django.urls import path
from . import views

urlpatterns = [
    path('', views.CustomerWishlistView.as_view(), name='wishlist'),
    path('<int:product_id>/', views.WishlistItemDeleteView.as_view(), name='wishlist_item_delete'),
]
