from rest_framework import serializers
from apps.shipping.models import ShippingZone, ShippingRate, WeightDeliveryTier


class ShippingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRate
        fields = '__all__'


class ShippingZoneSerializer(serializers.ModelSerializer):
    rates = ShippingRateSerializer(many=True, read_only=True)

    class Meta:
        model = ShippingZone
        fields = '__all__'


class WeightDeliveryTierSerializer(serializers.ModelSerializer):
    weight_range_display = serializers.SerializerMethodField()

    class Meta:
        model = WeightDeliveryTier
        fields = ['id', 'name', 'min_weight_grams', 'max_weight_grams', 'charge', 'is_active', 'sort_order', 'weight_range_display']

    def get_weight_range_display(self, obj):
        min_kg = float(obj.min_weight_grams) / 1000
        if obj.max_weight_grams:
            max_kg = float(obj.max_weight_grams) / 1000
            return f"{min_kg:.2f} kg - {max_kg:.2f} kg"
        return f"{min_kg:.2f} kg+"
