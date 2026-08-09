"""
Marketing app — Campaigns and abandoned cart re-engagement.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class MarketingCampaign(TimeStampedModel):
    """Marketing campaign targeting customer segments."""
    TYPE_CHOICES = [
        ('email', 'Email Campaign'),
        ('push', 'Push Notification'),
        ('sms', 'SMS Campaign'),
        ('abandoned_cart', 'Abandoned Cart Recovery'),
        ('win_back', 'Win Back Inactive Customers'),
        ('loyalty', 'Loyalty Reward'),
        ('promotion', 'Promotional'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('paused', 'Paused'),
    ]

    TARGET_CHOICES = [
        ('all', 'All Customers'),
        ('registered', 'Registered Customers'),
        ('new', 'New Customers (0-1 orders)'),
        ('returning', 'Returning Customers'),
        ('most_valuable', 'Most Valuable (top 10% LTV)'),
        ('high_spenders', 'High Spenders'),
        ('inactive', 'Inactive (no order in 90 days)'),
        ('most_ordered', 'Most Ordered Customers'),
        ('high_cancellation', 'High Cancellation Customers'),
        ('abandoned_cart', 'Abandoned Cart Users'),
        ('segment', 'Custom Segment'),
        ('coupon', 'Coupon Holders'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    campaign_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    target_segment = models.CharField(max_length=30, choices=TARGET_CHOICES, default='all')
    target_customer_group = models.ForeignKey(
        'customers.CustomerGroup', null=True, blank=True, on_delete=models.SET_NULL
    )
    subject = models.CharField(max_length=300, blank=True)
    message = models.TextField(blank=True)
    coupon = models.ForeignKey(
        'coupons.Coupon', null=True, blank=True, on_delete=models.SET_NULL, related_name='campaigns'
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Stats (denormalized)
    total_recipients = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    opened_count = models.PositiveIntegerField(default=0)
    clicked_count = models.PositiveIntegerField(default=0)
    converted_count = models.PositiveIntegerField(default=0)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'marketing_campaigns'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class CampaignRecipient(TimeStampedModel):
    """Individual customer in a campaign."""
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='recipients')
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaign_recipients'
    )
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    opened = models.BooleanField(default=False)
    clicked = models.BooleanField(default=False)
    converted = models.BooleanField(default=False, help_text='Made a purchase after campaign')

    class Meta:
        db_table = 'campaign_recipients'
        unique_together = [('campaign', 'customer')]


class CampaignEvent(TimeStampedModel):
    """Track campaign engagement events."""
    EVENT_CHOICES = [
        ('sent', 'Sent'),
        ('opened', 'Opened'),
        ('clicked', 'Clicked'),
        ('converted', 'Converted'),
        ('unsubscribed', 'Unsubscribed'),
        ('bounced', 'Bounced'),
    ]

    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='events')
    recipient = models.ForeignKey(CampaignRecipient, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'campaign_events'
        ordering = ['-created_at']
