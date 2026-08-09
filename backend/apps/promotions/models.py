"""
Promotions app — Flash sales, percentage/fixed/BOGO/bundle/category promotions.
"""
from decimal import Decimal
from django.db import models
from core.models import TimeStampedModel


class Promotion(TimeStampedModel):
    """Admin-created promotional offer."""
    TYPE_CHOICES = [
        ('flash_sale', 'Flash Sale'),
        ('percentage', 'Percentage Discount'),
        ('fixed', 'Fixed Discount'),
        ('bogo', 'Buy One Get One'),
        ('bundle', 'Bundle Discount'),
        ('category', 'Category Offer'),
        ('product', 'Product Offer'),
        ('new_customer', 'New Customer Offer'),
        ('account', 'Account Customer Offer'),
        ('seasonal', 'Seasonal Offer'),
        ('limited_time', 'Limited Time Offer'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    promotion_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_type = models.CharField(
        max_length=20,
        choices=[('percentage', 'Percentage'), ('fixed', 'Fixed')],
        default='percentage'
    )
    minimum_quantity = models.PositiveIntegerField(default=1)
    buy_quantity = models.PositiveIntegerField(default=1, help_text='BOGO: buy X')
    get_quantity = models.PositiveIntegerField(default=1, help_text='BOGO: get Y free')
    start_date = models.DateTimeField(null=True, blank=True, db_index=True)
    end_date = models.DateTimeField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=0, help_text='Higher = applied first when conflicts')
    stackable = models.BooleanField(default=False, help_text='Can stack with coupons/other promotions')
    banner_image = models.ImageField(upload_to='promotions/', null=True, blank=True)
    badge_text = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'promotions'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return self.name

    @property
    def is_active_now(self):
        from django.utils import timezone
        if not self.is_active:
            return False
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True


class PromotionProduct(models.Model):
    """Products included in a promotion."""
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='products')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='promotions')
    variant = models.ForeignKey(
        'products.ProductVariant', null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'promotion_products'
        unique_together = [('promotion', 'product')]


class PromotionCategory(models.Model):
    """Categories included in a promotion."""
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='categories')
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, related_name='promotions')

    class Meta:
        db_table = 'promotion_categories'
        unique_together = [('promotion', 'category')]
