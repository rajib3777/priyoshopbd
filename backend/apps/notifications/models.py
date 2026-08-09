"""
Notifications app — Notification center with preferences, templates, and logs.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class NotificationTemplate(TimeStampedModel):
    """Admin-managed notification templates per event type."""
    EVENT_CHOICES = [
        # Customer
        ('order_placed', 'Order Placed'),
        ('order_confirmed', 'Order Confirmed'),
        ('order_packed', 'Order Packed'),
        ('order_shipped', 'Order Shipped'),
        ('order_out_for_delivery', 'Out for Delivery'),
        ('order_delivered', 'Order Delivered'),
        ('order_cancelled', 'Order Cancelled'),
        ('return_approved', 'Return Approved'),
        ('return_rejected', 'Return Rejected'),
        ('refund_issued', 'Refund Issued'),
        ('coupon_received', 'Coupon Received'),
        ('promotion', 'Promotion'),
        ('welcome', 'Welcome'),
        ('password_reset', 'Password Reset'),
        # Admin
        ('new_order', 'New Order (Admin)'),
        ('low_stock', 'Low Stock Alert (Admin)'),
        ('out_of_stock', 'Out of Stock (Admin)'),
        ('return_request', 'Return Request (Admin)'),
        ('suspicious_order', 'Suspicious Order (Admin)'),
        ('coupon_alert', 'Coupon Usage Alert (Admin)'),
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES, unique=True)
    title_template = models.CharField(max_length=300,
                                      help_text='Use {{variable}} placeholders')
    body_template = models.TextField(help_text='Use {{variable}} placeholders')
    email_subject = models.CharField(max_length=300, blank=True)
    email_body = models.TextField(blank=True)
    is_email_enabled = models.BooleanField(default=True)
    is_push_enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'notification_templates'

    def __str__(self):
        return f'Template: {self.event_type}'


class NotificationPreference(TimeStampedModel):
    """Per-customer notification preferences."""
    customer = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_prefs'
    )
    order_updates_email = models.BooleanField(default=True)
    order_updates_push = models.BooleanField(default=True)
    promotions_email = models.BooleanField(default=True)
    promotions_push = models.BooleanField(default=True)
    coupon_email = models.BooleanField(default=True)
    coupon_push = models.BooleanField(default=True)

    class Meta:
        db_table = 'notification_preferences'


class Notification(TimeStampedModel):
    """In-app notification for a user."""
    TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    event_type = models.CharField(max_length=50, blank=True, db_index=True)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    title = models.CharField(max_length=300)
    body = models.TextField()
    action_url = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f'{self.recipient.email}: {self.title}'


class NotificationLog(TimeStampedModel):
    """Delivery attempt log per channel."""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    channel = models.CharField(max_length=20, choices=[
        ('email', 'Email'), ('push', 'Push'), ('sms', 'SMS')
    ])
    status = models.CharField(max_length=20, choices=[
        ('sent', 'Sent'), ('failed', 'Failed'), ('pending', 'Pending')
    ], default='pending')
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = 'notification_logs'
