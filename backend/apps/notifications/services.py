"""
Notification dispatcher service for customer & admin notifications.
"""
import logging
from django.core.mail import send_mail
from django.conf import settings
from apps.notifications.models import Notification, NotificationTemplate, NotificationLog

logger = logging.getLogger('apps.notifications')


def notify_order_placed(order):
    """Trigger customer & admin notification when order is placed."""
    # 1. Customer Notification
    if order.customer:
        Notification.objects.create(
            recipient=order.customer,
            event_type='order_placed',
            notification_type='success',
            title=f'Order #{order.order_number} Received!',
            body=f'Thank you for your order. Total: ৳{order.grand_total}',
            action_url=f'/account/orders/{order.order_number}'
        )

    # 2. Admin Notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    staff_users = User.objects.filter(is_staff=True, is_active=True)

    for staff in staff_users:
        Notification.objects.create(
            recipient=staff,
            event_type='new_order',
            notification_type='info',
            title=f'New Order: #{order.order_number}',
            body=f'Customer {order.customer_name} placed an order worth ৳{order.grand_total}',
            action_url=f'/admin/orders/{order.id}'
        )


def notify_suspicious_order(order, reasons):
    """Notify admin about suspicious order flag."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    staff_users = User.objects.filter(is_staff=True, is_active=True)

    for staff in staff_users:
        Notification.objects.create(
            recipient=staff,
            event_type='suspicious_order',
            notification_type='warning',
            title=f'⚠️ Suspicious Order Flagged: #{order.order_number}',
            body=f'Reasons: {", ".join(reasons)}',
            action_url=f'/admin/orders/{order.id}'
        )
