from rest_framework import generics
from core.permissions import IsAdminOrReadOnly
from apps.promotions.models import Promotion
from apps.promotions.serializers import PromotionSerializer


class PromotionListView(generics.ListCreateAPIView):
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Promotion.objects.all().order_by('-priority', '-created_at')
    filterset_fields = ['promotion_type', 'is_active']
    search_fields = ['name', 'description']


class PromotionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'
    queryset = Promotion.objects.all()
