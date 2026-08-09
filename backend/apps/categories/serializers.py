"""
Serializers for Categories and Brands
"""
from rest_framework import serializers
from apps.categories.models import Category, SubCategory
from apps.catalog.models import Brand


class SubCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SubCategory
        fields = [
            'id', 'category', 'name', 'slug', 'description', 'image', 'icon',
            'is_active', 'sort_order', 'show_in_menu', 'product_count',
            'seo_title', 'seo_description', 'seo_keywords'
        ]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'icon',
            'is_active', 'sort_order', 'show_in_menu', 'subcategories', 'product_count',
            'seo_title', 'seo_description', 'seo_keywords'
        ]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'logo', 'description', 'website',
            'is_active', 'sort_order', 'is_featured'
        ]
