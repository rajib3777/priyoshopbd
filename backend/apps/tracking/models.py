"""
Tracking app — GA4, GTM, Meta Pixel configuration (DB-controlled, NOT hardcoded).
"""
from django.db import models
from core.models import TimeStampedModel


class TrackingSetting(TimeStampedModel):
    """
    Singleton: All tracking IDs managed from admin panel.
    Frontend fetches these from API — never hardcoded.
    """
    # Google Analytics 4
    ga4_enabled = models.BooleanField(default=False)
    ga4_measurement_id = models.CharField(max_length=50, blank=True)

    # Google Tag Manager
    gtm_enabled = models.BooleanField(default=False)
    gtm_container_id = models.CharField(max_length=50, blank=True)

    # Meta Pixel (Facebook)
    meta_pixel_enabled = models.BooleanField(default=False)
    meta_pixel_id = models.CharField(max_length=50, blank=True)

    # Custom head scripts
    custom_head_scripts = models.TextField(blank=True, help_text='Custom HTML/JS injected in <head>')
    custom_body_scripts = models.TextField(blank=True, help_text='Custom HTML/JS injected after <body>')

    class Meta:
        db_table = 'tracking_settings'

    def __str__(self):
        return 'Tracking Settings'

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
