"""
Products app models — Complete product catalog with variants, pricing history, bundles, and rankings.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import BaseModel


def product_image_path(instance, filename):
    return f'products/{instance.product.slug}/{filename}'


# ─── Product ──────────────────────────────────────────────────────────────────

class Product(BaseModel):
    """Core product model with full enterprise fields."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('archived', 'Archived'),
    ]

    # Identity
    name = models.CharField(max_length=300, db_index=True)
    slug = models.SlugField(max_length=320, unique=True, db_index=True)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    barcode = models.CharField(max_length=100, blank=True, db_index=True)

    # Relations
    category = models.ForeignKey(
        'categories.Category', on_delete=models.PROTECT, related_name='products'
    )
    subcategory = models.ForeignKey(
        'categories.SubCategory', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='products'
    )
    brand = models.ForeignKey(
        'catalog.Brand', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='products'
    )

    # Content
    short_description = models.TextField(blank=True, max_length=500)
    description = models.TextField(blank=True)
    specifications = models.JSONField(default=list, blank=True,
                                      help_text='[{"label": "...", "value": "..."}]')
    video_url = models.URLField(blank=True)

    # Physical
    weight = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    length = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    width = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # ─── Pricing (CRITICAL: never overwrite history) ─────────────────────────
    buying_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    admin_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'),
                                      help_text='Internal/reference price')
    published_price = models.DecimalField(max_digits=12, decimal_places=2,
                                          help_text='Customer-facing selling price')
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                         help_text='Sale price (lower than published)')
    minimum_selling_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Status flags
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_trending = models.BooleanField(default=False, db_index=True)
    is_bestseller = models.BooleanField(default=False, db_index=True)
    is_new_arrival = models.BooleanField(default=False, db_index=True)
    is_flash_sale = models.BooleanField(default=False, db_index=True)

    # Inventory
    track_inventory = models.BooleanField(default=True)
    allow_backorder = models.BooleanField(default=False)
    low_stock_threshold = models.PositiveIntegerField(
        default=settings.DEFAULT_LOW_STOCK_THRESHOLD
    )

    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)
    meta_image = models.ImageField(upload_to='products/meta/', null=True, blank=True)

    # Analytics (denormalized for performance)
    view_count = models.PositiveIntegerField(default=0)
    cart_add_count = models.PositiveIntegerField(default=0)
    wishlist_count = models.PositiveIntegerField(default=0)
    order_count = models.PositiveIntegerField(default=0)
    units_sold = models.PositiveIntegerField(default=0)
    revenue_total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    profit_total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))

    # Ranking
    trending_score = models.FloatField(default=0.0, db_index=True)
    bestseller_rank = models.PositiveIntegerField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['is_trending', 'is_active']),
            models.Index(fields=['is_bestseller', 'is_active']),
            models.Index(fields=['is_new_arrival', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['trending_score']),
        ]

    def __str__(self):
        return self.name

    @property
    def effective_price(self):
        """Customer-facing price (discount_price if set, else published_price)."""
        if self.discount_price and self.discount_price < self.published_price:
            return self.discount_price
        return self.published_price

    @property
    def discount_percentage(self):
        if self.discount_price and self.discount_price < self.published_price:
            diff = self.published_price - self.discount_price
            return round((diff / self.published_price) * 100)
        return 0

    @property
    def potential_margin(self):
        return self.effective_price - self.buying_price

    @property
    def margin_percentage(self):
        if self.buying_price > 0:
            return round((self.potential_margin / self.buying_price) * 100, 2)
        return 0


# ─── Product Image ─────────────────────────────────────────────────────────────

class ProductImage(BaseModel):
    """Product gallery images."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=product_image_path)
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'product_images'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.product.name} - image {self.sort_order}'

    def save(self, *args, **kwargs):
        # Ensure only one primary image per product
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


# ─── Product Variant ──────────────────────────────────────────────────────────

class ProductVariant(BaseModel):
    """Size/color/etc. variants of a product."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=200, help_text='e.g. "Red / XL"')
    sku = models.CharField(max_length=100, unique=True)
    barcode = models.CharField(max_length=100, blank=True)

    # Attributes
    color = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=100, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    additional_attributes = models.JSONField(default=dict, blank=True)

    # Pricing overrides (null = use product price)
    buying_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    published_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Image
    image = models.ImageField(upload_to='variants/', null=True, blank=True)

    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'product_variants'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.product.name} - {self.name}'

    def get_effective_price(self):
        p = self.published_price or self.product.published_price
        d = self.discount_price or self.product.discount_price
        if d and d < p:
            return d
        return p

    def get_buying_price(self):
        return self.buying_price or self.product.buying_price


# ─── Product Tag ──────────────────────────────────────────────────────────────

class ProductTag(models.Model):
    """Simple M2M tags for products."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='tags')
    tag = models.CharField(max_length=100, db_index=True)

    class Meta:
        db_table = 'product_tags'
        unique_together = [('product', 'tag')]

    def __str__(self):
        return self.tag


# ─── Price History ────────────────────────────────────────────────────────────

class ProductPriceHistory(models.Model):
    """
    Immutable record of every price change.
    Never delete these — financial audit trail.
    """
    PRICE_TYPE_CHOICES = [
        ('buying_price', 'Buying Price'),
        ('admin_price', 'Admin Price'),
        ('published_price', 'Published Price'),
        ('discount_price', 'Discount Price'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_history')
    variant = models.ForeignKey(
        ProductVariant, null=True, blank=True, on_delete=models.SET_NULL, related_name='price_history'
    )
    price_type = models.CharField(max_length=20, choices=PRICE_TYPE_CHOICES)
    old_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    new_price = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='price_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'product_price_history'
        ordering = ['-changed_at']

    def __str__(self):
        return f'{self.product.name} - {self.price_type}: {self.old_price} → {self.new_price}'


# ─── Product Bundle ───────────────────────────────────────────────────────────

class ProductBundle(BaseModel):
    """
    Admin-created product bundles / combo products.
    Example: 'Eid Combo' containing multiple products at a special price.
    """
    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='bundles/', null=True, blank=True)
    bundle_price = models.DecimalField(max_digits=12, decimal_places=2,
                                       help_text='Special price for the bundle')
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        db_table = 'product_bundles'
        ordering = ['sort_order']

    def __str__(self):
        return self.name

    @property
    def original_total(self):
        """Sum of individual product effective prices."""
        return sum(
            item.product.effective_price * item.quantity
            for item in self.items.select_related('product').all()
        )

    @property
    def discount_amount(self):
        return max(self.original_total - self.bundle_price, Decimal('0.00'))


class BundleItem(models.Model):
    """Individual product in a bundle."""
    bundle = models.ForeignKey(ProductBundle, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='bundle_items')
    variant = models.ForeignKey(
        ProductVariant, null=True, blank=True, on_delete=models.SET_NULL
    )
    quantity = models.PositiveIntegerField(default=1)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'bundle_items'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.bundle.name} → {self.product.name} x{self.quantity}'
