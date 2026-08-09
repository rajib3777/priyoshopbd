from rest_framework import serializers
from apps.promotions.models import Promotion, PromotionProduct, PromotionCategory, DealOfferCard


class PromotionSerializer(serializers.ModelSerializer):
    is_active_now = serializers.BooleanField(read_only=True)

    class Meta:
        model = Promotion
        fields = '__all__'


class DealOfferCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealOfferCard
        fields = '__all__'
