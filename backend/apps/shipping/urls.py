from django.urls import path
from . import views

urlpatterns = [
    path('zones/', views.ShippingZoneListView.as_view(), name='shipping_zones'),
    path('rates/', views.ShippingRateListCreateView.as_view(), name='shipping_rates'),
    path('weight-tiers/', views.WeightDeliveryTierListCreateView.as_view(), name='weight_delivery_tiers'),
    path('weight-tiers/<int:pk>/', views.WeightDeliveryTierDetailView.as_view(), name='weight_delivery_tier_detail'),
]
