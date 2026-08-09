"""
Cart app models — Guest + authenticated persistent cart, abandoned cart tracking.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class Cart(TimeStampedModel):
    """
    Persistent server-side cart.
    Guest carts use session_key. Authenticated carts link to user.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='cart',
    )
    session_key = models.CharField(max_length=100, blank=True, db_index=True)
    coupon = models.ForeignKey(
        'coupons.Coupon', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='carts'
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'carts'

    def __str__(self):
        return f'Cart for {self.user or self.session_key}'

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.filter(
            product__is_active=True, product__deleted_at__isnull=True
        ))

    def get_item_count(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0


class CartItem(TimeStampedModel):
    """Individual item in a cart."""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey(
        'products.ProductVariant', null=True, blank=True, on_delete=models.SET_NULL
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'cart_items'
        unique_together = [('cart', 'product', 'variant')]

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'

    @property
    def unit_price(self):
        if self.variant:
            return self.variant.get_effective_price()
        return self.product.effective_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class AbandonedCart(TimeStampedModel):
    """
    Snapshot of a cart that was abandoned.
    Celery task marks carts abandoned after ABANDONED_CART_TIMEOUT_MINUTES.
    Used for analytics and future re-engagement campaigns.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='abandoned_carts',
    )
    session_key = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    items_snapshot = models.JSONField(default=list, help_text='Snapshot of cart items at abandonment')
    total_value = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    item_count = models.PositiveIntegerField(default=0)
    abandoned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    recovered = models.BooleanField(default=False, db_index=True)
    recovered_at = models.DateTimeField(null=True, blank=True)
    recovery_order = models.ForeignKey(
        'orders.Order', null=True, blank=True, on_delete=models.SET_NULL, related_name='+'
    )
    campaign_sent = models.BooleanField(default=False)
    campaign_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'abandoned_carts'
        ordering = ['-abandoned_at']
        indexes = [
            models.Index(fields=['user', 'recovered']),
            models.Index(fields=['abandoned_at']),
        ]

    def __str__(self):
        return f'Abandoned cart — {self.user or self.email} — {self.total_value}'
