from rest_framework import serializers
from apps.promotions.models import Promotion, PromotionProduct, PromotionCategory, DealOfferCard


class PromotionSerializer(serializers.ModelSerializer):
    is_active_now = serializers.BooleanField(read_only=True)

    class Meta:
        model = Promotion
        fields = '__all__'


class DealOfferCardSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, default='')

    class Meta:
        model = DealOfferCard
        fields = '__all__'

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True, status='active').count()
