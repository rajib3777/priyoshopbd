"""
Settings Manager app — SiteSetting, SEOSetting, FooterSection.
"""
from django.db import models
from core.models import TimeStampedModel


class SiteSetting(TimeStampedModel):
    """
    Global site configuration. Singleton table.
    All content must come from here — never hardcode.
    """
    site_name = models.CharField(max_length=200, default='PriyoShop')
    tagline = models.CharField(max_length=300, blank=True)
    logo = models.ImageField(upload_to='settings/', null=True, blank=True)
    favicon = models.ImageField(upload_to='settings/', null=True, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    phone_secondary = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    currency_code = models.CharField(max_length=10, default='BDT')
    currency_symbol = models.CharField(max_length=10, default='৳')
    timezone = models.CharField(max_length=50, default='Asia/Dhaka')
    default_language = models.CharField(max_length=10, default='en')

    # Social links
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)

    # Feature flags
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)
    allow_registration = models.BooleanField(default=True)
    allow_guest_checkout = models.BooleanField(default=True)
    cod_enabled = models.BooleanField(default=True)
    reviews_enabled = models.BooleanField(default=True)
    wishlist_enabled = models.BooleanField(default=True)
    account_discount_enabled = models.BooleanField(default=True)

    # Order settings
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    require_email_at_checkout = models.BooleanField(default=False)
    require_postal_code = models.BooleanField(default=False)

    # Tax
    tax_enabled = models.BooleanField(default=False)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_label = models.CharField(max_length=50, default='VAT')

    # Shipping & Discounts
    dhaka_delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=60)
    outside_dhaka_delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=120)
    free_delivery_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=2000)
    account_discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2)

    # Content & Hero Banner
    announcement_bar_text = models.CharField(max_length=500, default="Special Eid Offer: Extra 2% Account Discount + Free Delivery in Dhaka!")
    hero_badge_text = models.CharField(max_length=200, default="Next-Gen Shopping Experience")
    hero_title = models.CharField(max_length=300, default="Next-Gen Smartphones & Modern Lifestyle")
    hero_subtitle = models.TextField(default="Upgrade your lifestyle with authentic brand products, official warranty, extra 2% account discount & instant Cash on Delivery across Bangladesh.")
    hero_image = models.ImageField(upload_to='hero/', null=True, blank=True)
    hero_btn_text = models.CharField(max_length=100, default="Explore Shop")
    hero_btn_url = models.CharField(max_length=200, default="/shop")

    # Footer
    FOOTER_COLOR_CHOICES = [
        ('dark', 'Dark (Default)'),
        ('navy', 'Deep Navy Blue'),
        ('green', 'Dark Green'),
        ('purple', 'Deep Purple'),
        ('slate', 'Slate Gray'),
        ('brand', 'Brand Color'),
    ]
    footer_color = models.CharField(max_length=20, choices=FOOTER_COLOR_CHOICES, default='dark')
    footer_tagline = models.CharField(max_length=300, blank=True)

    class Meta:
        db_table = 'site_settings'

    def __str__(self):
        return self.site_name

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class SEOSetting(TimeStampedModel):
    """Global SEO configuration."""
    site_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    meta_keywords = models.CharField(max_length=500, blank=True)
    og_title = models.CharField(max_length=200, blank=True)
    og_description = models.TextField(blank=True)
    og_image = models.ImageField(upload_to='seo/', null=True, blank=True)
    twitter_card = models.CharField(max_length=50, default='summary_large_image')
    robots_txt = models.TextField(default='User-agent: *\nAllow: /', blank=True)
    google_site_verification = models.CharField(max_length=200, blank=True)
    canonical_url = models.URLField(blank=True)

    class Meta:
        db_table = 'seo_settings'

    def __str__(self):
        return 'SEO Settings'

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class FooterSection(TimeStampedModel):
    """Dynamic footer column management."""
    title = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'footer_sections'
        ordering = ['sort_order']

    def __str__(self):
        return self.title


class FooterLink(TimeStampedModel):
    """Links within a footer column."""
    section = models.ForeignKey(FooterSection, on_delete=models.CASCADE, related_name='links')
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=300)
    open_in_new_tab = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'footer_links'
        ordering = ['sort_order']
