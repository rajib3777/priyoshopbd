from django.urls import path
from . import views

urlpatterns = [
    path('addresses/', views.CustomerAddressListCreateView.as_view(), name='address_list'),
    path('addresses/<int:pk>/', views.CustomerAddressDetailView.as_view(), name='address_detail'),
    path('admin/customers/', views.AdminCustomerListView.as_view(), name='admin_customer_list'),
    path('admin/groups/', views.AdminCustomerGroupListCreateView.as_view(), name='admin_customer_groups'),
]
