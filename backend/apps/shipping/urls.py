from django.urls import path
from . import views

urlpatterns = [
    path('zones/', views.ShippingZoneListView.as_view(), name='shipping_zones'),
    path('rates/', views.ShippingRateListCreateView.as_view(), name='shipping_rates'),
]
