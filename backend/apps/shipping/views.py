from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsAdminOrReadOnly, IsAdminUser as IsAdmin
from apps.shipping.models import ShippingZone, ShippingRate, WeightDeliveryTier
from apps.shipping.serializers import ShippingZoneSerializer, ShippingRateSerializer, WeightDeliveryTierSerializer


class ShippingZoneListView(generics.ListCreateAPIView):
    serializer_class = ShippingZoneSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = ShippingZone.objects.filter(is_active=True).prefetch_related('rates')


class ShippingRateListCreateView(generics.ListCreateAPIView):
    serializer_class = ShippingRateSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = ShippingRate.objects.filter(is_active=True)


class WeightDeliveryTierListCreateView(generics.ListCreateAPIView):
    """List all weight delivery tiers (public read) or create (admin only)."""
    serializer_class = WeightDeliveryTierSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = WeightDeliveryTier.objects.all().order_by('sort_order', 'min_weight_grams')


class WeightDeliveryTierDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific weight delivery tier (admin only)."""
    serializer_class = WeightDeliveryTierSerializer
    permission_classes = [IsAdmin]
    queryset = WeightDeliveryTier.objects.all()
