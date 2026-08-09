"""
Product views - Public search/filter & Admin product management (with price history tracking)
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F
from core.permissions import IsAdminUser, IsAdminOrReadOnly
from core.pagination import StandardResultsPagination, LargeResultsPagination
from .models import (
    Product, ProductVariant, ProductImage, ProductPriceHistory,
    ProductBundle, BundleItem
)
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, AdminProductSerializer,
    ProductVariantSerializer, ProductPriceHistorySerializer, ProductBundleSerializer,
    ProductImageSerializer
)

BANGLA_SEARCH_MAP = {
    'মোবাইল': ['mobile', 'phone', 'smartphone'],
    'মবাইল': ['mobile', 'phone', 'smartphone'],
    'ফোন': ['phone', 'mobile', 'smartphone'],
    'স্মার্টফোন': ['smartphone', 'phone', 'mobile'],
    'ল্যাপটপ': ['laptop', 'computer', 'notebook'],
    'লেপটপ': ['laptop', 'computer'],
    'কম্পিউটার': ['computer', 'pc', 'desktop', 'laptop'],
    'ঘড়ি': ['watch', 'smartwatch'],
    'ঘড়ি': ['watch', 'smartwatch'],
    'ওয়াচ': ['watch', 'smartwatch'],
    'স্মার্টওয়াচ': ['smartwatch', 'watch'],
    'টিভি': ['tv', 'television'],
    'টেলিভিশন': ['television', 'tv'],
    'হেডফোন': ['headphone', 'earphone', 'headset', 'airpods', 'earbuds'],
    'ইয়ারফোন': ['earphone', 'headphone', 'earbuds'],
    'ইয়ারফোন': ['earphone', 'headphone', 'earbuds'],
    'ক্যামেরা': ['camera'],
    'ফ্রিজ': ['fridge', 'refrigerator'],
    'রেফ্রিজারেটর': ['refrigerator', 'fridge'],
    'এসি': ['ac', 'air conditioner'],
    'চার্জার': ['charger', 'cable', 'adapter'],
    'কভার': ['cover', 'case'],
    'কেস': ['case', 'cover'],
    'স্পিকার': ['speaker', 'bluetooth'],
    'পাওয়ার ব্যাংক': ['power bank', 'powerbank', 'battery'],
    'সার্ট': ['shirt', 't-shirt', 'tshirt'],
    'শার্ট': ['shirt', 't-shirt', 'tshirt'],
    'গেঞ্জি': ['t-shirt', 'tshirt', 'shirt', 'polos'],
    'টিসার্ট': ['t-shirt', 'tshirt'],
    'টিশার্ট': ['t-shirt', 'tshirt'],
    'প্যান্ট': ['pant', 'pants', 'jeans', 'trousers'],
    'পেন্ট': ['pant', 'pants', 'jeans'],
    'জিন্স': ['jeans', 'pant', 'denim'],
    'জুতা': ['shoe', 'shoes', 'sneakers', 'footwear'],
    'জুতো': ['shoe', 'shoes', 'sneakers'],
    'স্নিকার্স': ['sneakers', 'shoes'],
    'ব্যাগ': ['bag', 'backpack', 'handbag'],
    'ব্যাগপ্যাক': ['backpack', 'bag'],
    'জ্যাকেট': ['jacket', 'coat'],
    'থ্রি পিস': ['three piece', '3 piece', 'dress', 'kurti'],
    'শাড়ি': ['saree', 'sari'],
    'শারি': ['saree', 'sari'],
    'পাঞ্জাবি': ['panjabi', 'kurta'],
    'স্যামসাং': ['samsung'],
    'সামসাং': ['samsung'],
    'আইফোন': ['iphone', 'apple'],
    'আপেল': ['apple', 'iphone'],
    'শাওমি': ['xiaomi', 'mi', 'redmi'],
    'জিয়াওমি': ['xiaomi', 'mi'],
    'রিয়েলমি': ['realme'],
    'ওয়ালটন': ['walton'],
    'ওয়ালটন': ['walton'],
    'অপ্পো': ['oppo'],
    'ভিভো': ['vivo'],
    'সনি': ['sony'],
    'আসুস': ['asus'],
    'ডেল': ['dell'],
    'এইচপি': ['hp'],
    'লেনোভো': ['lenovo'],
}


def build_smart_search_filter(search_term):
    """
    Builds a flexible Django Q filter supporting Bangla transliterated terms,
    typo resilience (fuzzy prefix & stem matching), and multi-field coverage.
    """
    if not search_term:
        return Q()

    terms = set()
    raw = search_term.strip().lower()
    terms.add(raw)

    # Check whole string mapping
    if raw in BANGLA_SEARCH_MAP:
        terms.update(BANGLA_SEARCH_MAP[raw])

    # Check individual words
    words = raw.split()
    for w in words:
        terms.add(w)
        if w in BANGLA_SEARCH_MAP:
            terms.update(BANGLA_SEARCH_MAP[w])
        # Fuzzy stems for typos (e.g. 'samsun' -> 'samsu', 'mobie' -> 'mobi')
        if len(w) >= 4:
            terms.add(w[:-1])
            terms.add(w[:-2])

    query = Q()
    for term in terms:
        if not term or len(term) < 2:
            continue
        query |= (
            Q(name__icontains=term) |
            Q(sku__icontains=term) |
            Q(barcode__icontains=term) |
            Q(short_description__icontains=term) |
            Q(description__icontains=term) |
            Q(category__name__icontains=term) |
            Q(subcategory__name__icontains=term) |
            Q(brand__name__icontains=term) |
            Q(tags__tag__icontains=term) |
            Q(seo_keywords__icontains=term) |
            Q(seo_title__icontains=term)
        )

    return query


class ProductListView(generics.ListAPIView):
    """Customer-facing product listing & search with Bangla + Fuzzy Search support."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsPagination
    filterset_fields = [
        'category', 'subcategory', 'brand', 'is_featured', 'is_trending',
        'is_bestseller', 'is_new_arrival', 'is_flash_sale'
    ]
    ordering_fields = ['created_at', 'published_price', 'view_count', 'units_sold', 'trending_score']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True, status='active', deleted_at__isnull=True)\
                            .select_related('category', 'brand', 'inventory')\
                            .prefetch_related('images')

        # Smart Search filter (Bangla + English + Fuzzy Typos)
        search_query = self.request.query_params.get('search')
        if search_query:
            qs = qs.filter(build_smart_search_filter(search_query)).distinct()

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(published_price__gte=min_price)
        if max_price:
            qs = qs.filter(published_price__lte=max_price)

        # Deal card filter — show products tagged to a specific deals & offers card
        deal_card_id = self.request.query_params.get('deal_card')
        if deal_card_id:
            qs = qs.filter(deal_cards__id=deal_card_id).distinct()

        # Custom sorting logic
        sort = self.request.query_params.get('sort')
        if sort == 'price_low':
            qs = qs.order_by('published_price')
        elif sort == 'price_high':
            qs = qs.order_by('-published_price')
        elif sort == 'popular':
            qs = qs.order_by('-view_count')
        elif sort == 'bestselling':
            qs = qs.order_by('-units_sold')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')

        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """Customer view product detail with related products."""
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.get_queryset()
        lookup_val = self.kwargs.get(self.lookup_field)
        if str(lookup_val).isdigit():
            return generics.get_object_or_404(queryset, id=int(lookup_val))
        return generics.get_object_or_404(queryset, slug=lookup_val)

    def get_queryset(self):
        return Product.objects.filter(is_active=True, status='active', deleted_at__isnull=True)\
                            .select_related('category', 'subcategory', 'brand', 'inventory')\
                            .prefetch_related('images', 'variants', 'tags')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Product.objects.filter(id=instance.id).update(view_count=F('view_count') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SearchSuggestionView(APIView):
    """Autocomplete search suggestions with Bangla & Fuzzy search support."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Response([])

        smart_filter = build_smart_search_filter(q)
        products = Product.objects.filter(
            smart_filter,
            is_active=True, status='active', deleted_at__isnull=True
        ).distinct().values('id', 'name', 'slug', 'published_price')[:8]

        return Response(list(products))


# ─── Admin Product Views ──────────────────────────────────────────────────────

class AdminProductListCreateView(generics.ListCreateAPIView):
    """Admin: List and Create Product with full price/inventory tracking."""
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    filterset_fields = ['status', 'category', 'subcategory', 'brand', 'is_featured', 'is_trending']
    search_fields = ['name', 'sku', 'barcode']
    ordering_fields = ['created_at', 'published_price', 'buying_price', 'units_sold', 'revenue_total', 'profit_total']

    def get_queryset(self):
        return Product.objects.all().select_related('category', 'subcategory', 'brand', 'inventory')

    def perform_create(self, serializer):
        product = serializer.save()
        # Create initial inventory row
        from apps.inventory.models import Inventory
        Inventory.objects.create(product=product, quantity=0)
        # Log initial price history
        ProductPriceHistory.objects.create(
            product=product,
            price_type='published_price',
            old_price=None,
            new_price=product.published_price,
            reason='Initial product creation',
            changed_by=self.request.user
        )


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Retrieve, update, soft-delete product. Tracks price changes."""
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
    queryset = Product.objects.all().select_related('category', 'subcategory', 'brand', 'inventory')

    def perform_update(self, serializer):
        old_instance = self.get_object()
        new_product = serializer.save()

        # Track price history changes automatically
        user = self.request.user
        if old_instance.buying_price != new_product.buying_price:
            ProductPriceHistory.objects.create(
                product=new_product, price_type='buying_price',
                old_price=old_instance.buying_price, new_price=new_product.buying_price,
                reason='Admin update', changed_by=user
            )
        if old_instance.published_price != new_product.published_price:
            ProductPriceHistory.objects.create(
                product=new_product, price_type='published_price',
                old_price=old_instance.published_price, new_price=new_product.published_price,
                reason='Admin update', changed_by=user
            )
        if old_instance.discount_price != new_product.discount_price:
            ProductPriceHistory.objects.create(
                product=new_product, price_type='discount_price',
                old_price=old_instance.discount_price, new_price=new_product.discount_price,
                reason='Admin update', changed_by=user
            )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = 'inactive'
        instance.save()


class AdminProductImageUploadView(generics.CreateAPIView):
    """Admin: Upload primary or gallery image for a product."""
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        is_primary = self.request.data.get('is_primary') == 'true' or self.request.data.get('is_primary') is True
        if is_primary and product_id:
            ProductImage.objects.filter(product_id=product_id).update(is_primary=False)
        serializer.save(is_primary=is_primary)


class ProductBundleListView(generics.ListCreateAPIView):
    """Product bundles & combo products list and creation."""
    serializer_class = ProductBundleSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = ProductBundle.objects.prefetch_related('items__product').filter(is_active=True)
