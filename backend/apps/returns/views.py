"""
Return / Refund / Exchange views & complete workflow processing
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from core.permissions import IsAdminUser
from core.pagination import StandardResultsPagination, LargeResultsPagination
from apps.returns.models import (
    ReturnReason, ReturnRequest, ReturnItem, ReturnStatusHistory, Refund, RefundItem
)
from apps.returns.serializers import (
    ReturnReasonSerializer, ReturnRequestSerializer, RefundSerializer
)
from apps.orders.models import Order, OrderItem
from apps.inventory.models import Inventory, InventoryTransaction


class ReturnReasonListView(generics.ListAPIView):
    serializer_class = ReturnReasonSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ReturnReason.objects.filter(is_active=True)


class CustomerReturnCreateView(APIView):
    """Customer submits return request for a delivered order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        items_data = request.data.get('items', [])
        reason_id = request.data.get('reason_id')
        customer_note = request.data.get('customer_note', '')
        return_type = request.data.get('return_type', 'return')

        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != 'delivered':
            return Response({'error': 'Only delivered orders can be returned'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            return_req = ReturnRequest.objects.create(
                order=order,
                customer=request.user,
                return_type=return_type,
                reason_id=reason_id,
                customer_note=customer_note,
                status='pending'
            )

            total_amount = 0
            for item_info in items_data:
                order_item_id = item_info.get('order_item_id')
                qty = int(item_info.get('quantity', 1))

                try:
                    order_item = OrderItem.objects.get(id=order_item_id, order=order)
                except OrderItem.DoesNotExist:
                    continue

                item_refund = order_item.unit_price * qty
                total_amount += item_refund

                ReturnItem.objects.create(
                    return_request=return_req,
                    order_item=order_item,
                    quantity=qty,
                    refund_amount=item_refund
                )

            return_req.total_return_amount = total_amount
            return_req.save()

            ReturnStatusHistory.objects.create(
                return_request=return_req,
                previous_status='',
                new_status='pending',
                changed_by=request.user,
                note='Return request submitted by customer'
            )

        return Response(ReturnRequestSerializer(return_req).data, status=status.HTTP_201_CREATED)


class CustomerReturnListView(generics.ListAPIView):
    """Customer list of return requests."""
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return ReturnRequest.objects.filter(customer=self.request.user).order_by('-created_at')


class AdminReturnListView(generics.ListAPIView):
    """Admin view for return requests management."""
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    filterset_fields = ['status', 'return_type']
    search_fields = ['order__order_number', 'customer__email', 'customer__first_name']

    def get_queryset(self):
        return ReturnRequest.objects.all().order_by('-created_at')


class AdminReturnDetailView(generics.RetrieveUpdateAPIView):
    """Admin update status & process refund & inventory restocking."""
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
    queryset = ReturnRequest.objects.all()

    def perform_update(self, serializer):
        old_req = self.get_object()
        new_req = serializer.save(handled_by=self.request.user)

        if old_req.status != new_req.status:
            ReturnStatusHistory.objects.create(
                return_request=new_req,
                previous_status=old_req.status,
                new_status=new_req.status,
                changed_by=self.request.user,
                note=f'Status updated by {self.request.user.email}'
            )

            # Restock inventory if completed/quality_passed
            if new_req.status in ['quality_passed', 'completed'] and old_req.status not in ['quality_passed', 'completed']:
                with transaction.atomic():
                    for r_item in new_req.items.all():
                        if r_item.restockable and r_item.order_item.product:
                            inv = getattr(r_item.order_item.variant, 'inventory', None) or getattr(r_item.order_item.product, 'inventory', None)
                            if inv:
                                prev_q = inv.quantity
                                inv.quantity += r_item.quantity
                                inv.save()

                                InventoryTransaction.objects.create(
                                    inventory=inv,
                                    transaction_type='returned',
                                    quantity=r_item.quantity,
                                    previous_quantity=prev_q,
                                    new_quantity=inv.quantity,
                                    reference=new_req.order.order_number,
                                    notes=f'Restocked from return #{new_req.id}',
                                    performed_by=self.request.user
                                )
