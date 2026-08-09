from rest_framework import serializers
from apps.inventory.models import Inventory, InventoryTransaction


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, default='')
    product_sku = serializers.CharField(source='product.sku', read_only=True, default='')
    variant_name = serializers.CharField(source='variant.name', read_only=True, default='')
    available_quantity = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'


class InventoryTransactionSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True, default='System')

    class Meta:
        model = InventoryTransaction
        fields = '__all__'
