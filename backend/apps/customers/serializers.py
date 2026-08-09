from rest_framework import serializers
from apps.customers.models import CustomerProfile, Address, CustomerGroup
from apps.accounts.serializers import UserProfileSerializer


class AddressSerializer(serializers.ModelSerializer):
    formatted = serializers.CharField(read_only=True)

    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['customer']


class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        fields = '__all__'


class AdminCustomerDetailSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    addresses = AddressSerializer(many=True, source='user.addresses', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = '__all__'
