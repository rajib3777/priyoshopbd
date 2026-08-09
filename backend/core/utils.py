"""
Common utility functions for PriyoShop.
"""
import random
import string
import uuid
from decimal import Decimal, ROUND_HALF_UP
from django.utils.text import slugify
from django.conf import settings


def generate_order_number():
    """Generate unique order number: PS-YYYYMMDD-XXXXX"""
    from django.utils import timezone
    now = timezone.now()
    date_part = now.strftime('%Y%m%d')
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f'PS-{date_part}-{random_part}'


def generate_unique_slug(model_class, value, slug_field='slug', instance=None):
    """Generate unique slug for a model field."""
    base_slug = slugify(value)
    slug = base_slug
    counter = 1
    qs = model_class.objects.filter(**{slug_field: slug})
    if instance and instance.pk:
        qs = qs.exclude(pk=instance.pk)
    while qs.exists():
        slug = f'{base_slug}-{counter}'
        counter += 1
        qs = model_class.objects.filter(**{slug_field: slug})
        if instance and instance.pk:
            qs = qs.exclude(pk=instance.pk)
    return slug


def round_currency(amount):
    """Round monetary amount to 2 decimal places using ROUND_HALF_UP."""
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))
    return amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def format_currency(amount, symbol=None):
    """Format amount with currency symbol."""
    if symbol is None:
        symbol = getattr(settings, 'CURRENCY_SYMBOL', '৳')
    rounded = round_currency(amount)
    return f'{symbol}{rounded:,.2f}'


def generate_coupon_code(length=8):
    """Generate a random uppercase coupon code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


def calculate_discount_amount(price, discount_type, discount_value):
    """
    Calculate discount amount.
    discount_type: 'percentage' | 'fixed'
    Returns Decimal discount amount.
    """
    price = Decimal(str(price))
    discount_value = Decimal(str(discount_value))
    if discount_type == 'percentage':
        return round_currency(price * discount_value / 100)
    else:
        return min(round_currency(discount_value), price)


def get_client_ip(request):
    """Get real client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def mask_phone(phone):
    """Mask middle digits of phone number for privacy."""
    if not phone or len(phone) < 6:
        return phone
    return phone[:3] + '*' * (len(phone) - 6) + phone[-3:]


def mask_email(email):
    """Mask email for privacy: j***@e***.com"""
    if not email or '@' not in email:
        return email
    local, domain = email.split('@', 1)
    masked_local = local[0] + '*' * (len(local) - 1) if len(local) > 1 else local
    domain_parts = domain.split('.')
    masked_domain = domain_parts[0][0] + '*' * (len(domain_parts[0]) - 1)
    return f'{masked_local}@{masked_domain}.{".".join(domain_parts[1:])}'
