from rest_framework import generics, permissions
from core.permissions import IsAdminUser
from core.pagination import LargeResultsPagination, StandardResultsPagination
from apps.customers.models import CustomerProfile, Address, CustomerGroup
from apps.customers.serializers import AddressSerializer, AdminCustomerDetailSerializer, CustomerGroupSerializer


class CustomerAddressListCreateView(generics.ListCreateAPIView):
    """Customer manages saved shipping addresses."""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class CustomerAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(customer=self.request.user)


class AdminCustomerListView(generics.ListAPIView):
    """Admin: List customers ranked by CLV / spent / orders."""
    serializer_class = AdminCustomerDetailSerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'user__phone']
    ordering_fields = ['total_spent', 'total_orders', 'lifetime_value', 'created_at']

    def get_queryset(self):
        return CustomerProfile.objects.select_related('user').all().order_by('-total_spent')


class AdminCustomerGroupListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerGroupSerializer
    permission_classes = [IsAdminUser]
    queryset = CustomerGroup.objects.all()
