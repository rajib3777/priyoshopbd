from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartDetailView.as_view(), name='cart_detail'),
    path('items/', views.CartItemAddView.as_view(), name='cart_item_add'),
    path('items/<int:item_id>/', views.CartItemUpdateView.as_view(), name='cart_item_update'),
    path('admin/abandoned-carts/', views.AdminAbandonedCartListView.as_view(), name='admin_abandoned_carts'),
]
