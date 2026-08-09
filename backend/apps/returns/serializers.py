"""
Return / Refund / Exchange serializers
"""
from rest_framework import serializers
from apps.returns.models import (
    ReturnReason, ReturnRequest, ReturnItem, ReturnStatusHistory,
    Refund, RefundItem, ExchangeRequest
)


class ReturnReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnReason
        fields = '__all__'


class ReturnItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='order_item.product_name', read_only=True)

    class Meta:
        model = ReturnItem
        fields = ['id', 'order_item', 'product_name', 'quantity', 'condition', 'restockable', 'refund_amount', 'notes']


class ReturnStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='System')

    class Meta:
        model = ReturnStatusHistory
        fields = ['id', 'previous_status', 'new_status', 'changed_by_name', 'note', 'created_at']


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'


class ExchangeRequestSerializer(serializers.ModelSerializer):
    new_product_name = serializers.CharField(source='new_product.name', read_only=True)

    class Meta:
        model = ExchangeRequest
        fields = '__all__'


class ReturnRequestSerializer(serializers.ModelSerializer):
    items = ReturnItemSerializer(many=True, read_only=True)
    status_history = ReturnStatusHistorySerializer(many=True, read_only=True)
    refund = RefundSerializer(read_only=True)
    exchange = ExchangeRequestSerializer(read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    reason_name = serializers.CharField(source='reason.reason', read_only=True, default='')

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'order', 'order_number', 'customer', 'return_type', 'status',
            'reason', 'reason_name', 'customer_note', 'admin_note', 'pickup_date',
            'received_date', 'total_return_amount', 'items', 'status_history',
            'refund', 'exchange', 'created_at'
        ]
