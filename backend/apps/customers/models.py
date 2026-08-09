"""
Customers app — CustomerProfile, Address, CustomerGroup, CLV metrics.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel, BaseModel


class CustomerGroup(TimeStampedModel):
    """Admin-defined customer segments."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'customer_groups'

    def __str__(self):
        return self.name


class CustomerProfile(TimeStampedModel):
    """Extended profile for customer (non-staff) users."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_profile',
    )
    groups = models.ManyToManyField(CustomerGroup, blank=True, related_name='customers')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    notes = models.TextField(blank=True, help_text='Admin notes about this customer')

    # CLV Metrics (denormalized for quick admin view)
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    average_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_items_purchased = models.PositiveIntegerField(default=0)
    lifetime_value = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    cancellation_count = models.PositiveIntegerField(default=0)
    return_count = models.PositiveIntegerField(default=0)
    first_order_date = models.DateTimeField(null=True, blank=True)
    last_order_date = models.DateTimeField(null=True, blank=True)

    # Fraud/Risk
    is_blocked = models.BooleanField(default=False)
    block_reason = models.TextField(blank=True)
    risk_score = models.FloatField(default=0.0, help_text='Calculated fraud risk 0-100')
    high_cancellation_alert = models.BooleanField(default=False)

    class Meta:
        db_table = 'customer_profiles'

    def __str__(self):
        return f'{self.user.email} (customer)'

    def update_clv(self):
        """Recalculate CLV metrics from orders. Called after order changes."""
        from apps.orders.models import Order
        orders = Order.objects.filter(
            customer=self.user,
            status__in=['delivered', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery']
        )
        self.total_orders = orders.count()
        self.total_spent = orders.aggregate(
            total=models.Sum('grand_total')
        )['total'] or Decimal('0.00')
        if self.total_orders > 0:
            self.average_order_value = self.total_spent / self.total_orders
        self.lifetime_value = self.total_spent
        first = orders.order_by('created_at').first()
        last = orders.order_by('-created_at').first()
        if first:
            self.first_order_date = first.created_at
        if last:
            self.last_order_date = last.created_at
        self.save(update_fields=[
            'total_orders', 'total_spent', 'average_order_value',
            'lifetime_value', 'first_order_date', 'last_order_date'
        ])


class Address(TimeStampedModel):
    """Customer shipping/billing address."""
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='addresses',
    )
    label = models.CharField(max_length=50, blank=True, help_text='e.g. Home, Office')
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address_line_1 = models.CharField(max_length=300)
    address_line_2 = models.CharField(max_length=300, blank=True)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='Bangladesh')
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = 'customer_addresses'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f'{self.full_name}, {self.city}'

    def save(self, *args, **kwargs):
        # Ensure only one default per customer
        if self.is_default:
            Address.objects.filter(customer=self.customer, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

    @property
    def formatted(self):
        parts = [self.address_line_1]
        if self.address_line_2:
            parts.append(self.address_line_2)
        parts.extend([self.area, self.city, self.country])
        return ', '.join(filter(None, parts))
