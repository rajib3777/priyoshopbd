"""
Orders app models — Order, OrderItem (with price snapshot), OrderStatusHistory, OrderNote,
OrderRiskScore, FraudFlag, BlockedPhone/Address/Customer.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel, BaseModel


class Order(TimeStampedModel):
    """
    Customer order. All financial values are SNAPSHOTS at the time of order.
    Never recalculate from current product prices.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('sslcommerz', 'SSLCommerz'),
        ('stripe', 'Stripe'),
        ('card', 'Card'),
    ]

    # Identity
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='orders',
    )
    guest_email = models.EmailField(blank=True)

    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded')],
        default='pending',
    )

    # ─── Customer Info Snapshot ────────────────────────────────────────────
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True)

    # ─── Shipping Address Snapshot ─────────────────────────────────────────
    shipping_name = models.CharField(max_length=200)
    shipping_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_area = models.CharField(max_length=100, blank=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=100, default='Bangladesh')
    shipping_note = models.TextField(blank=True)

    # ─── Financial Summary (all Decimal, never float) ──────────────────────
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    coupon_discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    account_discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    shipping_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # ─── Weight & Delivery Tracking Snapshots ──────────────────────────────
    total_physical_weight_grams = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    chargeable_weight_grams = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    is_single_product_free_delivery = models.BooleanField(default=False)
    delivery_charge_reason = models.CharField(max_length=100, blank=True, default='')
    delivery_tier_name = models.CharField(max_length=100, blank=True, default='')
    delivery_tier_min_weight = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    delivery_tier_max_weight = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Profit tracking (snapshot)
    total_buying_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    estimated_profit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    realized_profit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Coupon
    coupon = models.ForeignKey(
        'coupons.Coupon', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='orders'
    )
    coupon_code_used = models.CharField(max_length=50, blank=True)

    # Flags
    is_flagged = models.BooleanField(default=False, db_index=True)
    idempotency_key = models.CharField(max_length=100, blank=True, unique=True, null=True,
                                        help_text='Prevent duplicate order creation')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['order_number']),
        ]

    def __str__(self):
        return self.order_number


class OrderItem(TimeStampedModel):
    """
    Order line item — FULL financial snapshot at order time.
    Never recalculate profit using current product prices.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        'products.Product', null=True, on_delete=models.SET_NULL, related_name='order_items'
    )
    variant = models.ForeignKey(
        'products.ProductVariant', null=True, blank=True, on_delete=models.SET_NULL
    )

    # Identity snapshot
    product_name = models.CharField(max_length=300)
    product_sku = models.CharField(max_length=100)
    variant_name = models.CharField(max_length=200, blank=True)

    quantity = models.PositiveIntegerField()

    # ─── Price snapshots (CRITICAL — never use current product prices) ──────
    buying_price_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
    admin_price_snapshot = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    published_price_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price_snapshot = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2,
                                     help_text='Actual price charged to customer')
    item_discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    line_buying_cost = models.DecimalField(max_digits=12, decimal_places=2)
    line_profit = models.DecimalField(max_digits=12, decimal_places=2)

    # ─── Measurement & Weight Snapshot ─────────────────────────────────────
    measurement_type = models.CharField(max_length=20, default='weight')
    measurement_value = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal('0.000'))
    measurement_unit = models.CharField(max_length=20, default='g')
    density_g_per_ml = models.DecimalField(max_digits=6, decimal_places=3, default=Decimal('1.000'))
    unit_weight_grams = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    total_weight_grams = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    delivery_charge_applicable = models.BooleanField(default=True)
    free_delivery_when_alone = models.BooleanField(default=False)

    # Return tracking
    returned_quantity = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f'{self.order.order_number} — {self.product_name} x{self.quantity}'


class OrderStatusHistory(TimeStampedModel):
    """Full timeline of order status changes."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='order_status_changes'
    )
    note = models.TextField(blank=True)

    class Meta:
        db_table = 'order_status_history'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.order.order_number}: {self.previous_status} → {self.new_status}'


class OrderNote(TimeStampedModel):
    """Internal or customer-facing notes on an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    note = models.TextField()
    is_internal = models.BooleanField(default=True, help_text='If True, not shown to customer')

    class Meta:
        db_table = 'order_notes'
        ordering = ['created_at']


# ─── Fraud / Risk Management ──────────────────────────────────────────────────

class OrderRiskScore(TimeStampedModel):
    """
    Calculated risk score for an order.
    High score = potentially fraudulent COD order.
    """
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='risk_score')
    score = models.FloatField(default=0.0, help_text='0-100, higher = riskier')
    reasons = models.JSONField(default=list, help_text='List of risk factors detected')
    is_flagged = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='reviewed_risks'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'order_risk_scores'

    def __str__(self):
        return f'{self.order.order_number} — Risk: {self.score:.1f}'


class FraudFlag(TimeStampedModel):
    """Manual or automatic fraud flag on an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='fraud_flags')
    flag_type = models.CharField(max_length=50)
    reason = models.TextField()
    flagged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'fraud_flags'


class BlockedPhone(TimeStampedModel):
    """Blocked phone numbers — orders from these are auto-flagged."""
    phone = models.CharField(max_length=20, unique=True, db_index=True)
    reason = models.TextField(blank=True)
    blocked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'blocked_phones'

    def __str__(self):
        return self.phone


class BlockedAddress(TimeStampedModel):
    """Blocked shipping addresses."""
    address_hash = models.CharField(max_length=64, unique=True, db_index=True,
                                    help_text='SHA256 of normalized address')
    address_preview = models.CharField(max_length=300, help_text='Human-readable preview')
    reason = models.TextField(blank=True)
    blocked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'blocked_addresses'
