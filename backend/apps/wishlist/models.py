"""
Wishlist app models.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class Wishlist(TimeStampedModel):
    customer = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist'
    )

    class Meta:
        db_table = 'wishlists'

    def __str__(self):
        return f'Wishlist of {self.customer.email}'


class WishlistItem(TimeStampedModel):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='wishlist_items')
    variant = models.ForeignKey(
        'products.ProductVariant', null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta:
        db_table = 'wishlist_items'
        unique_together = [('wishlist', 'product')]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.product.name} in {self.wishlist.customer.email} wishlist'
