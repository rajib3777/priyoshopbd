"""
Serializers for Product, ProductVariant, ProductImage, ProductBundle, and PriceHistory
"""
from rest_framework import serializers
from apps.products.models import (
    Product, ProductVariant, ProductImage, ProductTag,
    ProductPriceHistory, ProductBundle, BundleItem
)
from apps.categories.serializers import CategorySerializer, SubCategorySerializer
from apps.catalog.serializers import BrandSerializer


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_primary']


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.SerializerMethodField()
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'name', 'sku', 'barcode', 'color', 'size', 'weight',
            'additional_attributes', 'buying_price', 'published_price',
            'discount_price', 'effective_price', 'image', 'is_active',
            'sort_order', 'available_stock'
        ]

    def get_effective_price(self, obj):
        return obj.get_effective_price()

    def get_available_stock(self, obj):
        if hasattr(obj, 'inventory') and obj.inventory:
            return obj.inventory.available_quantity
        return 0


class ProductListSerializer(serializers.ModelSerializer):
    """Customer-facing product list serializer (no buying/admin price)."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    primary_image = serializers.SerializerMethodField()
    effective_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_name',
            'subcategory', 'brand', 'brand_name', 'short_description',
            'published_price', 'discount_price', 'effective_price',
            'discount_percentage', 'primary_image', 'is_featured',
            'is_trending', 'is_bestseller', 'is_new_arrival', 'is_flash_sale',
            'view_count', 'available_stock', 'created_at'
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return img.image.url if img and img.image else None

    def get_available_stock(self, obj):
        if hasattr(obj, 'inventory') and obj.inventory:
            return obj.inventory.available_quantity
        return 0


class ProductDetailSerializer(serializers.ModelSerializer):
    """Customer-facing detailed product view."""
    category = CategorySerializer(read_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    available_stock = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='tag')
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'barcode', 'category', 'subcategory',
            'brand', 'short_description', 'description', 'specifications',
            'video_url', 'weight', 'length', 'width', 'height',
            'published_price', 'discount_price', 'effective_price',
            'discount_percentage', 'primary_image', 'images', 'variants', 'tags',
            'is_featured', 'is_trending', 'is_bestseller', 'is_new_arrival',
            'is_flash_sale', 'track_inventory', 'allow_backorder',
            'available_stock', 'view_count', 'wishlist_count', 'seo_title',
            'seo_description', 'seo_keywords', 'related_products', 'created_at'
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return img.image.url if img and img.image else None

    def get_available_stock(self, obj):
        if hasattr(obj, 'inventory') and obj.inventory:
            return obj.inventory.available_quantity
        return 0

    def get_related_products(self, obj):
        qs = Product.objects.filter(is_active=True, status='active', deleted_at__isnull=True)\
                            .exclude(id=obj.id)\
                            .select_related('category', 'brand', 'inventory')\
                            .prefetch_related('images')
        
        related = Product.objects.none()
        if obj.subcategory_id:
            related = qs.filter(subcategory_id=obj.subcategory_id)
        if not related.exists() and obj.category_id:
            related = qs.filter(category_id=obj.category_id)
        if not related.exists() and obj.brand_id:
            related = qs.filter(brand_id=obj.brand_id)
        if not related.exists():
            related = qs.all()
            
        related = related.distinct()[:6]
        return ProductListSerializer(related, many=True, context=self.context).data


class AdminProductSerializer(serializers.ModelSerializer):
    """Admin full product serializer with financial prices and margin metrics."""
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    potential_margin = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    margin_percentage = serializers.FloatField(read_only=True)
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_available_stock(self, obj):
        if hasattr(obj, 'inventory') and obj.inventory:
            return obj.inventory.available_quantity
        return 0


class ProductPriceHistorySerializer(serializers.ModelSerializer):
    changed_by_email = serializers.SerializerMethodField()

    class Meta:
        model = ProductPriceHistory
        fields = '__all__'

    def get_changed_by_email(self, obj):
        return obj.changed_by.email if obj.changed_by else 'System'


class BundleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.effective_price', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = BundleItem
        fields = ['id', 'bundle', 'product', 'product_name', 'product_price', 'variant', 'quantity', 'sort_order']


class ProductBundleSerializer(serializers.ModelSerializer):
    items = BundleItemSerializer(many=True, read_only=True)
    original_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ProductBundle
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'bundle_price',
            'original_total', 'discount_amount', 'is_active', 'start_date',
            'end_date', 'sort_order', 'seo_title', 'seo_description', 'items'
        ]
