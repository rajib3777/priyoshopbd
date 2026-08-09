"""
Audit Log model — records all important admin actions.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class AuditLog(TimeStampedModel):
    """
    Immutable audit trail for admin/staff operations.
    """
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('export', 'Export'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('publish', 'Publish'),
        ('unpublish', 'Unpublish'),
        ('restore', 'Restore'),
        ('status_change', 'Status Change'),
        ('price_change', 'Price Change'),
        ('stock_change', 'Stock Change'),
        ('settings_change', 'Settings Change'),
        ('permission_change', 'Permission Change'),
        ('unknown', 'Unknown'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
        db_index=True,
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES, db_index=True)
    entity = models.CharField(max_length=100, db_index=True)
    entity_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    request_data = models.JSONField(default=dict, blank=True)
    previous_data = models.JSONField(default=dict, blank=True)
    new_data = models.JSONField(default=dict, blank=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['entity', 'entity_id']),
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.user} - {self.action} - {self.entity} ({self.entity_id})'

    @classmethod
    def log(cls, user, action, entity, entity_id='', description='',
            ip_address=None, previous_data=None, new_data=None, extra=None):
        """Convenience method to create audit log entries."""
        return cls.objects.create(
            user=user,
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            description=description,
            ip_address=ip_address,
            previous_data=previous_data or {},
            new_data=new_data or {},
            extra=extra or {},
        )
