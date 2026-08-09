from rest_framework import serializers
from apps.reviews.models import Review, ReviewImage


class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'sort_order']


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'product_name', 'customer', 'customer_name', 'rating', 'title',
            'body', 'status', 'is_verified_purchase', 'helpful_count', 'images', 'created_at'
        ]
        read_only_fields = ['customer', 'status', 'is_verified_purchase', 'helpful_count']
