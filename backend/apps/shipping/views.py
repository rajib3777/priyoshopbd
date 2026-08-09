from rest_framework import generics
from core.permissions import IsAdminOrReadOnly
from apps.shipping.models import ShippingZone, ShippingRate
from apps.shipping.serializers import ShippingZoneSerializer, ShippingRateSerializer


class ShippingZoneListView(generics.ListCreateAPIView):
    serializer_class = ShippingZoneSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = ShippingZone.objects.filter(is_active=True).prefetch_related('rates')


class ShippingRateListCreateView(generics.ListCreateAPIView):
    serializer_class = ShippingRateSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = ShippingRate.objects.filter(is_active=True)
