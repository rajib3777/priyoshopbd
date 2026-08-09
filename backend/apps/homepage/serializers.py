"""
Homepage Section Builder serializers
"""
from rest_framework import serializers
from apps.homepage.models import (
    HomepageSection, HeroSlide, Banner, Testimonial, TrustFeature,
    VideoGalleryItem, AnnouncementBar
)
from apps.products.serializers import ProductListSerializer
from apps.categories.serializers import CategorySerializer


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'


class TrustFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustFeature
        fields = '__all__'


class VideoGalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoGalleryItem
        fields = '__all__'


class AnnouncementBarSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementBar
        fields = '__all__'


class HomepageSectionSerializer(serializers.ModelSerializer):
    hero_slides = HeroSlideSerializer(many=True, read_only=True)
    banners = BannerSerializer(many=True, read_only=True)
    testimonials = TestimonialSerializer(many=True, read_only=True)
    trust_features = TrustFeatureSerializer(many=True, read_only=True)
    video_items = VideoGalleryItemSerializer(many=True, read_only=True)
    featured_products_data = ProductListSerializer(source='featured_products', many=True, read_only=True)

    class Meta:
        model = HomepageSection
        fields = '__all__'
