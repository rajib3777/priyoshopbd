from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.CustomerOrderListView.as_view(), name='customer_order_list'),
    path('track/<str:order_number>/', views.CustomerOrderDetailView.as_view(), name='track_order'),
    path('reorder/<str:order_number>/', views.ReorderView.as_view(), name='reorder'),
    path('admin/orders/', views.AdminOrderListView.as_view(), name='admin_order_list'),
    path('admin/orders/<int:id>/', views.AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('admin/blocked-phones/', views.AdminBlockedPhoneListView.as_view(), name='admin_blocked_phones'),
    path('admin/blocked-addresses/', views.AdminBlockedAddressListView.as_view(), name='admin_blocked_addresses'),
]
