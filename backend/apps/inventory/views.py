"""
Inventory management views with automatic movement ledger recording.
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from core.permissions import IsAdminUser
from core.pagination import LargeResultsPagination
from apps.inventory.models import Inventory, InventoryTransaction
from apps.inventory.serializers import InventorySerializer, InventoryTransactionSerializer


class InventoryListView(generics.ListAPIView):
    """Admin view for stock status."""
    serializer_class = InventorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    search_fields = ['product__name', 'product__sku', 'variant__name', 'variant__sku']

    def get_queryset(self):
        qs = Inventory.objects.select_related('product', 'variant').all()
        stock_filter = self.request.query_params.get('filter')
        if stock_filter == 'low':
            qs = [i for i in qs if i.is_low_stock]
        elif stock_filter == 'out':
            qs = [i for i in qs if i.is_out_of_stock]
        return qs


class InventoryAdjustView(APIView):
    """Admin adjust stock and record movement ledger."""
    permission_classes = [IsAdminUser]

    def post(self, request, inventory_id):
        try:
            inv = Inventory.objects.select_for_update().get(id=inventory_id)
        except Inventory.DoesNotExist:
            return Response({'error': 'Inventory row not found'}, status=status.HTTP_404_NOT_FOUND)

        trans_type = request.data.get('transaction_type', 'adjustment')
        qty = int(request.data.get('quantity', 0))
        notes = request.data.get('notes', '')
        reference = request.data.get('reference', '')

        with transaction.atomic():
            prev_qty = inv.quantity

            if trans_type in ['stock_in', 'cancel', 'returned']:
                inv.quantity += abs(qty)
            elif trans_type in ['stock_out', 'damaged', 'sale']:
                inv.quantity -= abs(qty)
            elif trans_type == 'adjustment':
                inv.quantity = qty

            inv.save()

            trans = InventoryTransaction.objects.create(
                inventory=inv,
                transaction_type=trans_type,
                quantity=inv.quantity - prev_qty,
                previous_quantity=prev_qty,
                new_quantity=inv.quantity,
                reference=reference,
                notes=notes,
                performed_by=request.user
            )

        return Response({
            'success': True,
            'inventory': InventorySerializer(inv).data,
            'transaction': InventoryTransactionSerializer(trans).data
        })


class InventoryTransactionListView(generics.ListAPIView):
    """Immutable ledger history for inventory movements."""
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    filterset_fields = ['transaction_type', 'inventory']
    search_fields = ['reference', 'notes']

    def get_queryset(self):
        return InventoryTransaction.objects.all().order_by('-created_at')
