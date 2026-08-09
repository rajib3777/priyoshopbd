from rest_framework import serializers
from apps.discounts.models import AccountDiscountConfig


class AccountDiscountConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountDiscountConfig
        fields = '__all__'
