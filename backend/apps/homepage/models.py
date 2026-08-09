"""
Homepage app — Dynamic section builder with all section types.
"""
from django.db import models
from core.models import TimeStampedModel


class HomepageSection(TimeStampedModel):
    """
    Dynamic homepage section. Admin can add/reorder/enable/disable.
    """
    SECTION_TYPES = [
        ('hero', 'Hero Carousel'),
        ('banner', 'Banner'),
        ('category_grid', 'Category Grid'),
        ('product_grid', 'Product Grid'),
        ('flash_sale', 'Flash Sale'),
        ('deals', 'Deals'),
        ('offers', 'Offers'),
        ('featured_products', 'Featured Products'),
        ('trending_products', 'Trending Products'),
        ('best_sellers', 'Best Sellers'),
        ('new_arrivals', 'New Arrivals'),
        ('recently_viewed', 'Recently Viewed'),
        ('brands', 'Brand Showcase'),
        ('testimonials', 'Testimonials'),
        ('video_gallery', 'Video Gallery'),
        ('trust_features', 'Trust Features'),
        ('custom_html', 'Custom HTML'),
        ('newsletter', 'Newsletter Signup'),
        ('countdown', 'Countdown Timer'),
        ('promotion', 'Promotion Section'),
    ]

    section_type = models.CharField(max_length=30, choices=SECTION_TYPES)
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True, help_text='For custom_html type')
    image = models.ImageField(upload_to='homepage/', null=True, blank=True)
    link_url = models.CharField(max_length=300, blank=True)
    link_text = models.CharField(max_length=100, blank=True)
    sort_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    # Date-based visibility
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    # Products/categories to feature
    featured_products = models.ManyToManyField('products.Product', blank=True, related_name='homepage_sections')
    featured_categories = models.ManyToManyField('categories.Category', blank=True, related_name='homepage_sections')
    promotion = models.ForeignKey(
        'promotions.Promotion', null=True, blank=True, on_delete=models.SET_NULL, related_name='homepage_sections'
    )
    max_items = models.PositiveIntegerField(default=12, help_text='Max products/items to show')

    # Config
    config = models.JSONField(default=dict, blank=True, help_text='Extra configuration (columns, colors, etc.)')

    class Meta:
        db_table = 'homepage_sections'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.section_type}: {self.title}'

    @property
    def is_visible_now(self):
        from django.utils import timezone
        if not self.is_active:
            return False
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True


class HeroSlide(TimeStampedModel):
    """Individual slide for the hero carousel."""
    section = models.ForeignKey(HomepageSection, null=True, blank=True, on_delete=models.CASCADE, related_name='hero_slides')
    title = models.CharField(max_length=300, blank=True)
    subtitle = models.CharField(max_length=500, blank=True)
    image = models.ImageField(upload_to='hero/')
    mobile_image = models.ImageField(upload_to='hero/mobile/', null=True, blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_url = models.CharField(max_length=300, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hero_slides'
        ordering = ['sort_order']


class Banner(TimeStampedModel):
    """Promotional banner."""
    title = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='banners/')
    mobile_image = models.ImageField(upload_to='banners/mobile/', null=True, blank=True)
    link_url = models.CharField(max_length=300, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    section = models.ForeignKey(
        HomepageSection, null=True, blank=True, on_delete=models.SET_NULL, related_name='banners'
    )

    class Meta:
        db_table = 'banners'
        ordering = ['sort_order']


class Testimonial(TimeStampedModel):
    """Customer testimonial for social proof."""
    section = models.ForeignKey(HomepageSection, on_delete=models.CASCADE, related_name='testimonials')
    customer_name = models.CharField(max_length=100)
    customer_avatar = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    customer_location = models.CharField(max_length=100, blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    text = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'testimonials'
        ordering = ['sort_order']


class TrustFeature(TimeStampedModel):
    """Trust badge / feature (Free Shipping, Secure Payment, etc.)."""
    section = models.ForeignKey(HomepageSection, on_delete=models.CASCADE, related_name='trust_features')
    icon = models.CharField(max_length=100, blank=True, help_text='Icon name or SVG')
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=300, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'trust_features'
        ordering = ['sort_order']


class VideoGalleryItem(TimeStampedModel):
    """YouTube/video embed for video gallery section."""
    section = models.ForeignKey(HomepageSection, on_delete=models.CASCADE, related_name='video_items')
    title = models.CharField(max_length=200, blank=True)
    video_url = models.URLField()
    thumbnail = models.ImageField(upload_to='videos/', null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'video_gallery_items'
        ordering = ['sort_order']


class AnnouncementBar(TimeStampedModel):
    """Top announcement bar content."""
    text = models.CharField(max_length=500)
    link_url = models.CharField(max_length=300, blank=True)
    link_text = models.CharField(max_length=100, blank=True)
    background_color = models.CharField(max_length=20, default='#1a1a2e')
    text_color = models.CharField(max_length=20, default='#ffffff')
    is_active = models.BooleanField(default=False)
    dismissible = models.BooleanField(default=True)

    class Meta:
        db_table = 'announcement_bars'

    def __str__(self):
        return self.text[:50]
