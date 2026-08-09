from django.urls import path
from . import views

urlpatterns = [
    path('validate/', views.CouponValidateView.as_view(), name='coupon_validate'),
    path('active/', views.CustomerCouponListView.as_view(), name='active_coupons'),
    path('admin/coupons/', views.AdminCouponListCreateView.as_view(), name='admin_coupons_list'),
    path('admin/coupons/<int:id>/', views.AdminCouponDetailView.as_view(), name='admin_coupons_detail'),
    path('admin/target-assign/', views.TargetedCouponAssignView.as_view(), name='targeted_coupon_assign'),
]
