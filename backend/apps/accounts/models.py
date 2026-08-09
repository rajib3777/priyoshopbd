"""
Accounts app — Custom User model with email-based authentication.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from core.models import TimeStampedModel
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    """
    Custom User model for PriyoShop.
    Email is the unique identifier (not username).
    """
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    # Admin role (for staff users)
    admin_role = models.ForeignKey(
        'AdminRole',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='users',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['is_staff', 'is_active']),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def has_role_permission(self, permission_codename):
        """Check if admin user has a specific role permission."""
        if self.is_superuser:
            return True
        if not self.admin_role:
            return False
        return self.admin_role.permissions.filter(codename=permission_codename).exists()


class AdminRole(TimeStampedModel):
    """
    RBAC role for admin users.
    """
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('order_manager', 'Order Manager'),
        ('product_manager', 'Product Manager'),
        ('inventory_manager', 'Inventory Manager'),
        ('marketing_manager', 'Marketing Manager'),
        ('customer_support', 'Customer Support'),
        ('report_manager', 'Report Manager'),
        ('content_manager', 'Content Manager'),
    ]

    name = models.CharField(max_length=100, unique=True)
    role_type = models.CharField(max_length=30, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(
        'RolePermission',
        blank=True,
        related_name='roles',
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'admin_roles'

    def __str__(self):
        return self.name


class RolePermission(TimeStampedModel):
    """
    Granular permission for RBAC system.
    """
    RESOURCE_CHOICES = [
        ('products', 'Products'),
        ('categories', 'Categories'),
        ('inventory', 'Inventory'),
        ('orders', 'Orders'),
        ('returns', 'Returns'),
        ('customers', 'Customers'),
        ('coupons', 'Coupons'),
        ('promotions', 'Promotions'),
        ('reports', 'Reports'),
        ('finance', 'Finance'),
        ('cms', 'CMS'),
        ('homepage', 'Homepage'),
        ('marketing', 'Marketing'),
        ('settings', 'Settings'),
        ('audit', 'Audit Logs'),
        ('staff', 'Staff Management'),
    ]

    ACTION_CHOICES = [
        ('view', 'View'),
        ('create', 'Create'),
        ('change', 'Edit'),
        ('delete', 'Delete'),
        ('export', 'Export'),
        ('approve', 'Approve'),
        ('publish', 'Publish'),
        ('manage_settings', 'Manage Settings'),
        ('manage_finance', 'Manage Finance'),
    ]

    resource = models.CharField(max_length=50, choices=RESOURCE_CHOICES)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    codename = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'role_permissions'
        unique_together = [('resource', 'action')]

    def __str__(self):
        return self.codename

    def save(self, *args, **kwargs):
        if not self.codename:
            self.codename = f'{self.resource}.{self.action}'
        super().save(*args, **kwargs)


class PasswordResetToken(TimeStampedModel):
    """One-time password reset tokens."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=100, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = 'password_reset_tokens'

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at
