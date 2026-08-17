"""
Checkout View - executes atomic 20-step checkout workflow via CheckoutService.
"""
from decimal import Decimal
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.checkout.serializers import CheckoutRequestSerializer
from apps.checkout.services import CheckoutService
from apps.orders.serializers import OrderDetailSerializer


class PlaceOrderView(APIView):
    """Submit order via Cash on Delivery."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = CheckoutService(request, serializer.validated_data)
        try:
            order = service.place_order()
            order_data = OrderDetailSerializer(order).data
            return Response({
                'success': True,
                'message': 'Order placed successfully!',
                'order': order_data
            }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class DeliveryPreviewView(APIView):
    """
    Real-time delivery charge preview for checkout page.
    Accepts cart items (product IDs + quantities) and returns calculated delivery info.
    Backend is the single source of truth — never trust frontend delivery values.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from apps.cart.models import Cart
        from apps.shipping.services import DeliveryCalculator

        city = request.data.get('city', 'Dhaka')

        # Load cart from session / user
        if request.user.is_authenticated:
            cart = Cart.objects.filter(customer=request.user).first()
        else:
            session_key = request.session.session_key
            cart = Cart.objects.filter(session_key=session_key).first() if session_key else None

        if not cart or not cart.items.exists():
            return Response({
                'delivery_charge': '0.00',
                'delivery_charge_reason': 'empty_cart',
                'is_single_product_free_delivery': False,
                'total_physical_weight_grams': '0.000',
                'chargeable_weight_grams': '0.000',
                'chargeable_weight_kg': '0.000',
            })

        cart_items = list(cart.items.select_related('product').all())
        result = DeliveryCalculator.calculate(items=cart_items, city=city)

        return Response({
            'delivery_charge': str(result['delivery_charge']),
            'delivery_charge_reason': result.get('delivery_charge_reason', ''),
            'is_single_product_free_delivery': result.get('is_single_product_free_delivery', False),
            'total_physical_weight_grams': str(result.get('total_physical_weight_grams', '0.000')),
            'chargeable_weight_grams': str(result.get('chargeable_weight_grams', '0.000')),
            'chargeable_weight_kg': str(result.get('chargeable_weight_kg', '0.000')),
            'tier_name': result.get('tier_name', ''),
        })
