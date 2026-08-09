from rest_framework import generics
from core.permissions import IsAdminOrReadOnly
from apps.promotions.models import Promotion, DealOfferCard
from apps.promotions.serializers import PromotionSerializer, DealOfferCardSerializer


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


class DealOfferCardListView(generics.ListCreateAPIView):
    serializer_class = DealOfferCardSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return DealOfferCard.objects.all().order_by('sort_order', '-created_at')
        return DealOfferCard.objects.filter(is_active=True).order_by('sort_order', '-created_at')


class DealOfferCardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DealOfferCardSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'
    queryset = DealOfferCard.objects.all()
