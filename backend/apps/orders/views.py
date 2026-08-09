"""
Order views - Customer order history/tracking & Admin order management
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminUser
from core.pagination import StandardResultsPagination, LargeResultsPagination
from apps.orders.models import (
    Order, OrderStatusHistory, OrderNote, BlockedPhone, BlockedAddress
)
from apps.orders.serializers import (
    OrderListSerializer, OrderDetailSerializer, AdminOrderDetailSerializer,
    BlockedPhoneSerializer, BlockedAddressSerializer
)
from apps.cart.models import Cart, CartItem


class CustomerOrderListView(generics.ListAPIView):
    """Customer order history."""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')


class CustomerOrderDetailView(generics.RetrieveAPIView):
    """Customer order detail."""
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'order_number'

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items', 'status_history').all()
        if self.request.user and self.request.user.is_authenticated and not self.request.user.is_staff:
            qs = qs.filter(customer=self.request.user)
        return qs


class ReorderView(APIView):
    """Add items from previous order back into cart."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, customer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        for item in order.items.all():
            if item.product and item.product.is_active:
                CartItem.objects.update_or_create(
                    cart=cart, product=item.product, variant=item.variant,
                    defaults={'quantity': item.quantity}
                )

        return Response({'success': True, 'message': 'Items added to cart!'})


# ─── Admin Order Management ───────────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    """Admin: Search, filter, and list orders."""
    serializer_class = OrderListSerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    filterset_fields = ['status', 'payment_method', 'payment_status', 'is_flagged']
    search_fields = ['order_number', 'customer_name', 'customer_phone', 'customer_email', 'shipping_address']
    ordering_fields = ['created_at', 'grand_total', 'status']

    def get_queryset(self):
        return Order.objects.all().order_by('-created_at')


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """Admin: Detail & status update with status history recording."""
    serializer_class = AdminOrderDetailSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
    queryset = Order.objects.prefetch_related('items', 'status_history', 'notes').all()

    def perform_update(self, serializer):
        old_order = self.get_object()
        new_order = serializer.save()

        if old_order.status != new_order.status:
            OrderStatusHistory.objects.create(
                order=new_order,
                previous_status=old_order.status,
                new_status=new_order.status,
                changed_by=self.request.user,
                note=f'Status updated by {self.request.user.email}'
            )


class AdminBlockedPhoneListView(generics.ListCreateAPIView):
    serializer_class = BlockedPhoneSerializer
    permission_classes = [IsAdminUser]
    queryset = BlockedPhone.objects.all()


class AdminBlockedAddressListView(generics.ListCreateAPIView):
    serializer_class = BlockedAddressSerializer
    permission_classes = [IsAdminUser]
    queryset = BlockedAddress.objects.all()
