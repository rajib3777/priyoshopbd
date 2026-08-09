"""
Returns app models — Complete return/refund/exchange workflow.

Flow:
  Delivered → Customer requests return → Admin approves/rejects
  → Item received → Quality check → Refund OR Exchange → Inventory adjustment → Completed
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel, BaseModel


class ReturnReason(TimeStampedModel):
    """Admin-managed return reason codes."""
    reason = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'return_reasons'
        ordering = ['sort_order', 'reason']

    def __str__(self):
        return self.reason


class ReturnRequest(TimeStampedModel):
    """
    Customer return request linked to an order.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('pickup_scheduled', 'Pickup Scheduled'),
        ('received', 'Item Received'),
        ('quality_check', 'Quality Check'),
        ('quality_passed', 'Quality Passed'),
        ('quality_failed', 'Quality Failed — Rejected'),
        ('refund_initiated', 'Refund Initiated'),
        ('refund_completed', 'Refund Completed'),
        ('exchange_dispatched', 'Exchange Dispatched'),
        ('exchange_delivered', 'Exchange Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    TYPE_CHOICES = [
        ('return', 'Return'),
        ('exchange', 'Exchange'),
        ('refund', 'Refund Only'),
    ]

    order = models.ForeignKey(
        'orders.Order', on_delete=models.CASCADE, related_name='return_requests'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='return_requests'
    )
    return_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='return')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', db_index=True)
    reason = models.ForeignKey(
        ReturnReason, null=True, blank=True, on_delete=models.SET_NULL
    )
    customer_note = models.TextField(blank=True)
    admin_note = models.TextField(blank=True)
    pickup_date = models.DateField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)

    # Totals
    total_return_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Assigned handler
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='handled_returns'
    )

    class Meta:
        db_table = 'return_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['customer']),
        ]

    def __str__(self):
        return f'Return #{self.id} — {self.order.order_number}'


class ReturnItem(TimeStampedModel):
    """Specific items being returned."""
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='items')
    order_item = models.ForeignKey('orders.OrderItem', on_delete=models.CASCADE, related_name='return_items')
    quantity = models.PositiveIntegerField()
    condition = models.CharField(
        max_length=30,
        choices=[('good', 'Good'), ('damaged', 'Damaged'), ('missing_parts', 'Missing Parts')],
        blank=True,
    )
    restockable = models.BooleanField(default=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'return_items'

    def __str__(self):
        return f'{self.order_item.product_name} x{self.quantity}'


class ReturnStatusHistory(TimeStampedModel):
    """Full audit trail of return status changes."""
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    note = models.TextField(blank=True)

    class Meta:
        db_table = 'return_status_history'
        ordering = ['created_at']

    def __str__(self):
        return f'Return #{self.return_request.id}: {self.previous_status} → {self.new_status}'


class Refund(TimeStampedModel):
    """Refund issued for a return request."""
    METHOD_CHOICES = [
        ('cash', 'Cash (COD)'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('bank', 'Bank Transfer'),
        ('store_credit', 'Store Credit'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    return_request = models.OneToOneField(
        ReturnRequest, on_delete=models.CASCADE, related_name='refund'
    )
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='refunds')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='refunds')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference = models.CharField(max_length=200, blank=True, help_text='Transaction reference')
    notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='processed_refunds'
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'refunds'

    def __str__(self):
        return f'Refund {self.amount} for {self.order.order_number}'


class RefundItem(TimeStampedModel):
    """Per-item refund breakdown."""
    refund = models.ForeignKey(Refund, on_delete=models.CASCADE, related_name='items')
    return_item = models.OneToOneField(ReturnItem, on_delete=models.CASCADE, related_name='refund_item')
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'refund_items'


class ExchangeRequest(TimeStampedModel):
    """Exchange request — customer wants different product/variant."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('dispatched', 'Dispatched'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
    ]

    return_request = models.OneToOneField(
        ReturnRequest, on_delete=models.CASCADE, related_name='exchange'
    )
    original_order_item = models.ForeignKey(
        'orders.OrderItem', on_delete=models.CASCADE, related_name='exchanges'
    )
    new_product = models.ForeignKey(
        'products.Product', on_delete=models.CASCADE, related_name='exchanges'
    )
    new_variant = models.ForeignKey(
        'products.ProductVariant', null=True, blank=True, on_delete=models.SET_NULL
    )
    quantity = models.PositiveIntegerField()
    price_difference = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'),
                                           help_text='Positive = customer pays more')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    dispatched_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='dispatched_exchanges'
    )

    class Meta:
        db_table = 'exchange_requests'

    def __str__(self):
        return f'Exchange for return #{self.return_request.id}'
