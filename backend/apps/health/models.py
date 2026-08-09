"""
Health app — System health check API for admin dashboard.
"""
from django.db import models
from core.models import TimeStampedModel


class BackupLog(TimeStampedModel):
    """Records of automated backup runs."""
    backup_type = models.CharField(max_length=20, choices=[
        ('database', 'Database'), ('media', 'Media'), ('full', 'Full')
    ])
    status = models.CharField(max_length=20, choices=[
        ('success', 'Success'), ('failed', 'Failed'), ('running', 'Running')
    ])
    file_path = models.CharField(max_length=500, blank=True)
    file_size_bytes = models.BigIntegerField(null=True, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'backup_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.backup_type} backup — {self.status} at {self.created_at}'
