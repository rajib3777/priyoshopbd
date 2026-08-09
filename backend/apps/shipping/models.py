"""
Shipping app — Zone-based and flat rate shipping.
"""
from decimal import Decimal
from django.db import models
from core.models import TimeStampedModel


class ShippingZone(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    cities = models.TextField(blank=True, help_text='Comma-separated city names')
    areas = models.TextField(blank=True, help_text='Comma-separated area names')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'shipping_zones'
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class ShippingRate(TimeStampedModel):
    zone = models.ForeignKey(ShippingZone, on_delete=models.CASCADE, related_name='rates')
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    free_shipping_threshold = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text='Order value above which shipping is free'
    )
    is_active = models.BooleanField(default=True)
    estimated_days_min = models.PositiveIntegerField(default=1)
    estimated_days_max = models.PositiveIntegerField(default=3)

    class Meta:
        db_table = 'shipping_rates'

    def __str__(self):
        return f'{self.zone.name} — {self.name}: {self.rate}'

    def calculate(self, order_total):
        order_total = Decimal(str(order_total))
        if self.free_shipping_threshold and order_total >= self.free_shipping_threshold:
            return Decimal('0.00')
        return self.rate
