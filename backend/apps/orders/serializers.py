"""
Order serializers (Customer and Admin)
"""
from rest_framework import serializers
from apps.orders.models import (
    Order, OrderItem, OrderStatusHistory, OrderNote,
    OrderRiskScore, FraudFlag, BlockedPhone, BlockedAddress
)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'variant', 'product_name', 'product_sku', 'variant_name',
            'quantity', 'unit_price', 'item_discount', 'line_total', 'returned_quantity',
            'measurement_type', 'measurement_value', 'measurement_unit', 'density_g_per_ml',
            'unit_weight_grams', 'total_weight_grams', 'delivery_charge_applicable', 'free_delivery_when_alone'
        ]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='System')

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'previous_status', 'new_status', 'changed_by_name', 'note', 'created_at']


class OrderNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True, default='System')

    class Meta:
        model = OrderNote
        fields = ['id', 'author_name', 'note', 'is_internal', 'created_at']


class OrderRiskScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRiskScore
        fields = ['id', 'score', 'reasons', 'is_flagged', 'reviewed_at']


class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_method', 'payment_status',
            'customer_name', 'customer_phone', 'grand_total', 'item_count',
            'total_physical_weight_grams', 'is_single_product_free_delivery',
            'is_flagged', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_method', 'payment_status',
            'customer_name', 'customer_phone', 'customer_email', 'shipping_name',
            'shipping_phone', 'shipping_address', 'shipping_city', 'shipping_area',
            'shipping_postal_code', 'shipping_note', 'subtotal', 'discount_amount',
            'coupon_discount', 'account_discount', 'shipping_charge', 'grand_total',
            'total_physical_weight_grams', 'chargeable_weight_grams',
            'is_single_product_free_delivery', 'delivery_charge_reason',
            'coupon_code_used', 'items', 'status_history', 'is_flagged', 'created_at'
        ]


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    """Admin-only order details including financial buying cost and profit metrics."""
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    notes = OrderNoteSerializer(many=True, read_only=True)
    risk_score = OrderRiskScoreSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class BlockedPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedPhone
        fields = '__all__'


class BlockedAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedAddress
        fields = '__all__'
