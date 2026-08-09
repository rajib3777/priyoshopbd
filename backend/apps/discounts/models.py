"""
Discounts app — Account (2%) discount configuration.
"""
from decimal import Decimal
from django.db import models
from core.models import TimeStampedModel


class AccountDiscountConfig(TimeStampedModel):
    """
    Configurable account discount for registered customers.
    Singleton — only one active config at a time.
    """
    is_enabled = models.BooleanField(default=True)
    discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('2.00'),
        help_text='Default 2% discount for account holders'
    )
    minimum_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    maximum_discount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    eligible_after_orders = models.PositiveIntegerField(
        default=0, help_text='Minimum orders required before discount applies'
    )
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'account_discount_config'

    def __str__(self):
        return f'Account Discount: {self.discount_percentage}% ({"enabled" if self.is_enabled else "disabled"})'

    @classmethod
    def get_active(cls):
        return cls.objects.first()

    def calculate(self, order_amount, customer_order_count=0):
        """Server-side account discount calculation."""
        order_amount = Decimal(str(order_amount))
        if not self.is_enabled:
            return Decimal('0.00')
        if order_amount < self.minimum_order_value:
            return Decimal('0.00')
        if customer_order_count < self.eligible_after_orders:
            return Decimal('0.00')
        discount = order_amount * self.discount_percentage / 100
        if self.maximum_discount:
            discount = min(discount, self.maximum_discount)
        return discount.quantize(Decimal('0.01'))
