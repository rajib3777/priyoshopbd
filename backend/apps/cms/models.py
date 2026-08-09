"""
CMS app — Pages, Menus, MenuItem.
"""
from django.db import models
from core.models import TimeStampedModel


class CMSPage(TimeStampedModel):
    """Dynamic CMS page (About, Privacy, Terms, FAQ, etc.)."""
    TEMPLATE_CHOICES = [
        ('default', 'Default'),
        ('faq', 'FAQ'),
        ('policy', 'Policy'),
        ('contact', 'Contact'),
        ('careers', 'Careers'),
    ]

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, db_index=True)
    content = models.TextField()
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='default')
    is_published = models.BooleanField(default=False, db_index=True)
    is_system = models.BooleanField(default=False, help_text='System pages cannot be deleted')
    publish_date = models.DateTimeField(null=True, blank=True)

    # SEO
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = 'cms_pages'
        ordering = ['title']

    def __str__(self):
        return self.title


class Menu(TimeStampedModel):
    """Site navigation menu."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'menus'

    def __str__(self):
        return self.name


class MenuItem(TimeStampedModel):
    """Individual navigation item."""
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items')
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name='children'
    )
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=300, blank=True)
    category = models.ForeignKey(
        'categories.Category', null=True, blank=True, on_delete=models.SET_NULL
    )
    cms_page = models.ForeignKey(
        CMSPage, null=True, blank=True, on_delete=models.SET_NULL
    )
    icon = models.CharField(max_length=50, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    open_in_new_tab = models.BooleanField(default=False)
    badge_text = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'menu_items'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.menu.name} → {self.label}'
