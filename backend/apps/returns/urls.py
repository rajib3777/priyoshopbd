from django.urls import path
from . import views

urlpatterns = [
    path('reasons/', views.ReturnReasonListView.as_view(), name='return_reasons'),
    path('my-returns/', views.CustomerReturnListView.as_view(), name='customer_returns'),
    path('request/', views.CustomerReturnCreateView.as_view(), name='return_request_create'),
    path('admin/returns/', views.AdminReturnListView.as_view(), name='admin_returns_list'),
    path('admin/returns/<int:id>/', views.AdminReturnDetailView.as_view(), name='admin_returns_detail'),
]
