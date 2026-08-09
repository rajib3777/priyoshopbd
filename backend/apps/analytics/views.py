"""
Analytics & Profit Calculation Engine API
"""
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsAdminUser
from apps.orders.models import Order, OrderItem
from apps.products.models import Product
from apps.customers.models import CustomerProfile


class AdminDashboardAnalyticsView(APIView):
    """
    Main Admin Dashboard Overview Analytics
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        period = request.query_params.get('period', '30d')

        if period == '7d':
            start_date = now - timedelta(days=7)
        elif period == '30d':
            start_date = now - timedelta(days=30)
        elif period == '1y':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)

        orders_qs = Order.objects.filter(
            created_at__gte=start_date,
            status__in=['delivered', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'pending']
        )

        total_orders = orders_qs.count()
        metrics = orders_qs.aggregate(
            revenue=Sum('grand_total'),
            discounts=Sum('discount_amount'),
            cost=Sum('total_buying_cost'),
            profit=Sum('estimated_profit'),
            aov=Avg('grand_total')
        )

        revenue = metrics['revenue'] or Decimal('0.00')
        cost = metrics['cost'] or Decimal('0.00')
        profit = metrics['profit'] or Decimal('0.00')
        discounts = metrics['discounts'] or Decimal('0.00')
        aov = metrics['aov'] or Decimal('0.00')

        # Top products
        top_products = Product.objects.filter(is_active=True).order_by('-units_sold')[:5].values(
            'id', 'name', 'units_sold', 'revenue_total', 'profit_total'
        )

        # Top Customers by LTV
        top_customers = CustomerProfile.objects.select_related('user').order_by('-lifetime_value')[:5].values(
            'user__email', 'user__first_name', 'total_orders', 'lifetime_value'
        )

        return Response({
            'period': period,
            'summary': {
                'total_orders': total_orders,
                'revenue': str(revenue),
                'cost': str(cost),
                'profit': str(profit),
                'discounts': str(discounts),
                'average_order_value': str(round(aov, 2)),
            },
            'top_products': list(top_products),
            'top_customers': list(top_customers),
            'alerts': {
                'pending_orders': Order.objects.filter(status='pending').count(),
                'flagged_orders': Order.objects.filter(is_flagged=True).count(),
            }
        })
