"""
Reviews app — Verified purchaser reviews with admin moderation.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class Review(TimeStampedModel):
    """Product review — only by verified purchasers."""
    STATUS_CHOICES = [
        ('pending', 'Pending Moderation'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    order_item = models.ForeignKey(
        'orders.OrderItem', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews',
        help_text='Verified purchase link'
    )
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    is_verified_purchase = models.BooleanField(default=True)
    helpful_count = models.PositiveIntegerField(default=0)
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='moderated_reviews'
    )
    moderation_note = models.TextField(blank=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = [('product', 'customer')]
        indexes = [
            models.Index(fields=['product', 'status']),
        ]

    def __str__(self):
        return f'{self.customer.email} — {self.product.name} ({self.rating}★)'


class ReviewImage(TimeStampedModel):
    """Images attached to a review."""
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='reviews/')
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'review_images'
        ordering = ['sort_order']
