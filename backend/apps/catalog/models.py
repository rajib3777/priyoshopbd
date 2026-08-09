"""
Catalog app — Brand model.
"""
from django.db import models
from core.models import BaseModel


class Brand(BaseModel):
    """Product brand."""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)

    class Meta:
        db_table = 'brands'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name
