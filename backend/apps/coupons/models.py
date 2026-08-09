"""
Coupons app models — Full coupon engine with targeting.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class Coupon(TimeStampedModel):
    """Complete coupon model with all restriction options."""

    TYPE_CHOICES = [
        ('percentage', 'Percentage Discount'),
        ('fixed', 'Fixed Amount Discount'),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    coupon_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    maximum_discount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                           help_text='Cap on discount amount (for percentage type)')

    # Validity
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    # Usage limits
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Total uses allowed')
    usage_count = models.PositiveIntegerField(default=0)
    per_customer_limit = models.PositiveIntegerField(default=1, help_text='Uses per customer')

    # Restrictions
    product_restrictions = models.ManyToManyField(
        'products.Product', blank=True, related_name='coupons'
    )
    category_restrictions = models.ManyToManyField(
        'categories.Category', blank=True, related_name='coupons'
    )
    customer_restrictions = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='assigned_coupons'
    )
    customer_group_restrictions = models.ManyToManyField(
        'customers.CustomerGroup', blank=True, related_name='coupons'
    )

    # Special conditions
    first_order_only = models.BooleanField(default=False)
    account_only = models.BooleanField(default=False, help_text='Only registered customers')

    # Created by
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='created_coupons'
    )

    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_active']),
        ]

    def __str__(self):
        return f'{self.code} — {self.coupon_type}: {self.discount_value}'

    @property
    def is_valid_now(self):
        from django.utils import timezone
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        return True

    def calculate_discount(self, order_amount):
        """Calculate the discount amount for a given order amount. Server-side only."""
        order_amount = Decimal(str(order_amount))
        if order_amount < self.minimum_order_value:
            return Decimal('0.00')
        if self.coupon_type == 'percentage':
            discount = order_amount * self.discount_value / 100
            if self.maximum_discount:
                discount = min(discount, self.maximum_discount)
        else:
            discount = min(self.discount_value, order_amount)
        return discount.quantize(Decimal('0.01'))


class CouponAssignment(TimeStampedModel):
    """Links coupons to specific customers (targeted marketing)."""
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='assignments')
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_assignments'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='assigned_coupons_by'
    )
    segment_name = models.CharField(max_length=100, blank=True,
                                    help_text='Name of segment used for bulk assignment')
    is_notified = models.BooleanField(default=False)

    class Meta:
        db_table = 'coupon_assignments'
        unique_together = [('coupon', 'customer')]

    def __str__(self):
        return f'{self.coupon.code} → {self.customer.email}'


class CouponUsage(TimeStampedModel):
    """Records each coupon use."""
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usages'
    )
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='coupon_usages')
    discount_applied = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'coupon_usages'
        unique_together = [('coupon', 'order')]

    def __str__(self):
        return f'{self.coupon.code} used by {self.customer.email} on {self.order.order_number}'
