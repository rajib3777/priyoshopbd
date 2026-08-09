"""
Coupon views - validation, admin CRUD, and 1-click targeted coupon assignment to customer segments
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from core.permissions import IsAdminUser, IsAdminOrReadOnly
from apps.coupons.models import Coupon, CouponAssignment, CouponUsage
from apps.coupons.serializers import CouponSerializer, CouponApplySerializer, TargetedCouponAssignSerializer
from apps.customers.models import CustomerProfile

User = get_user_model()


class CouponValidateView(APIView):
    """Customer validate coupon code & calculate discount amount."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CouponApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code'].strip().upper()
        amount = serializer.validated_data['order_amount']

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Coupon code is invalid'}, status=status.HTTP_400_BAD_REQUEST)

        if not coupon.is_valid_now:
            return Response({'valid': False, 'message': 'Coupon is inactive or expired'}, status=status.HTTP_400_BAD_REQUEST)

        if coupon.account_only and not request.user.is_authenticated:
            return Response({'valid': False, 'message': 'This coupon requires a customer account'}, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(amount)
        return Response({
            'valid': True,
            'code': coupon.code,
            'coupon_type': coupon.coupon_type,
            'discount_value': coupon.discount_value,
            'discount_amount': discount
        })


class AdminCouponListCreateView(generics.ListCreateAPIView):
    """Admin CRUD for coupons."""
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
    queryset = Coupon.objects.all().order_by('-created_at')
    search_fields = ['code', 'name']


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
    queryset = Coupon.objects.all()


class TargetedCouponAssignView(APIView):
    """1-Click targeted coupon creation & assignment to customer segment."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = TargetedCouponAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        target_segment = data['target_segment']

        # 1. Fetch target customers based on segment
        customers_qs = User.objects.filter(is_staff=False, is_active=True)

        if target_segment == 'new':
            customers_qs = customers_qs.filter(customer_profile__total_orders=0)
        elif target_segment == 'most_valuable':
            customers_qs = customers_qs.order_by('-customer_profile__lifetime_value')[:50]
        elif target_segment == 'high_spenders':
            customers_qs = customers_qs.filter(customer_profile__total_spent__gte=5000)
        elif target_segment == 'inactive':
            customers_qs = customers_qs.filter(customer_profile__total_orders__gt=0).order_by('customer_profile__last_order_date')[:50]
        elif target_segment == 'high_cancellation':
            customers_qs = customers_qs.filter(customer_profile__cancellation_count__gt=0)

        target_customers = list(customers_qs)

        # 2. Get or Create Coupon
        coupon_id = data.get('coupon_id')
        if coupon_id:
            coupon = Coupon.objects.get(id=coupon_id)
        else:
            coupon = Coupon.objects.create(
                code=data.get('code', '').upper(),
                name=data.get('name', f'Special Offer for {target_segment.title()}'),
                coupon_type=data.get('coupon_type', 'percentage'),
                discount_value=data.get('discount_value', 10),
                created_by=request.user
            )

        # 3. Bulk assign
        assigned_count = 0
        for customer in target_customers:
            obj, created = CouponAssignment.objects.get_or_create(
                coupon=coupon,
                customer=customer,
                defaults={'assigned_by': request.user, 'segment_name': target_segment}
            )
            if created:
                assigned_count += 1

        return Response({
            'success': True,
            'message': f'Coupon "{coupon.code}" assigned to {assigned_count} customers in segment "{target_segment}".',
            'coupon': CouponSerializer(coupon).data,
            'assigned_count': assigned_count
        })


class CustomerCouponListView(generics.ListAPIView):
    """Public/Customer active available coupons."""
    serializer_class = CouponSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Coupon.objects.filter(is_active=True).order_by('-created_at')
