"""
Inventory app — Stock management with full transaction history.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class Inventory(TimeStampedModel):
    """Current stock level per product/variant."""
    product = models.OneToOneField(
        'products.Product', on_delete=models.CASCADE,
        related_name='inventory', null=True, blank=True
    )
    variant = models.OneToOneField(
        'products.ProductVariant', on_delete=models.CASCADE,
        related_name='inventory', null=True, blank=True
    )
    quantity = models.IntegerField(default=0)
    reserved_quantity = models.IntegerField(default=0, help_text='Reserved by pending orders')
    damaged_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=settings.DEFAULT_LOW_STOCK_THRESHOLD)

    class Meta:
        db_table = 'inventory'
        verbose_name_plural = 'Inventories'
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['variant']),
            models.Index(fields=['quantity']),
        ]

    def __str__(self):
        name = self.variant or self.product
        return f'{name} — qty: {self.available_quantity}'

    @property
    def available_quantity(self):
        """Stock available for purchase."""
        return max(self.quantity - self.reserved_quantity, 0)

    @property
    def is_low_stock(self):
        return 0 < self.available_quantity <= self.low_stock_threshold

    @property
    def is_out_of_stock(self):
        return self.available_quantity <= 0


class InventoryTransaction(TimeStampedModel):
    """
    Immutable ledger of every stock movement.
    """
    TYPE_CHOICES = [
        ('stock_in', 'Stock In'),
        ('stock_out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
        ('damaged', 'Damaged'),
        ('returned', 'Customer Return'),
        ('reserved', 'Reserved'),
        ('unreserved', 'Unreserved'),
        ('sale', 'Sale Deduction'),
        ('cancel', 'Order Cancel Restock'),
    ]

    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    quantity = models.IntegerField(help_text='Positive = in, Negative = out')
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    reference = models.CharField(max_length=200, blank=True, help_text='Order number, PO, etc.')
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='inventory_transactions'
    )

    class Meta:
        db_table = 'inventory_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['inventory', 'transaction_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.transaction_type}: {self.quantity} (ref: {self.reference})'
