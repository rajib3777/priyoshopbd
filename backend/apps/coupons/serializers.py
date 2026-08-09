"""
Coupon serializers & Targeted Coupon Assignment
"""
from rest_framework import serializers
from apps.coupons.models import Coupon, CouponAssignment, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = '__all__'


class CouponApplySerializer(serializers.Serializer):
    code = serializers.CharField()
    order_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class TargetedCouponAssignSerializer(serializers.Serializer):
    coupon_id = serializers.IntegerField(required=False)
    # Coupon fields if creating new
    code = serializers.CharField(required=False)
    name = serializers.CharField(required=False)
    coupon_type = serializers.ChoiceField(choices=['percentage', 'fixed'], default='percentage')
    discount_value = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    # Target segment
    target_segment = serializers.ChoiceField(choices=[
        'all', 'registered', 'new', 'most_valuable', 'high_spenders', 'inactive', 'high_cancellation'
    ])
