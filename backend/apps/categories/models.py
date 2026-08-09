"""
Categories app — Category and SubCategory with SEO, image, ordering.
"""
from django.db import models
from core.models import BaseModel


def category_image_path(instance, filename):
    return f'categories/{instance.slug}/{filename}'


class Category(BaseModel):
    """Top-level product category."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to=category_image_path, null=True, blank=True)
    icon = models.CharField(max_length=100, blank=True, help_text='Icon class or SVG name')
    is_active = models.BooleanField(default=True, db_index=True)
    sort_order = models.PositiveIntegerField(default=0, db_index=True)
    show_in_menu = models.BooleanField(default=True)

    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']
        indexes = [
            models.Index(fields=['is_active', 'sort_order']),
        ]

    def __str__(self):
        return self.name

    @property
    def product_count(self):
        return self.products.filter(is_active=True, deleted_at__isnull=True).count()


class SubCategory(BaseModel):
    """Sub-category under a parent category."""
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='subcategories',
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='subcategories/', null=True, blank=True)
    icon = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    sort_order = models.PositiveIntegerField(default=0)
    show_in_menu = models.BooleanField(default=True)

    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = 'subcategories'
        verbose_name_plural = 'Sub Categories'
        ordering = ['sort_order', 'name']
        unique_together = [('category', 'slug')]

    def __str__(self):
        return f'{self.category.name} → {self.name}'

    @property
    def product_count(self):
        return self.products.filter(is_active=True, deleted_at__isnull=True).count()
