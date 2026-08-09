"""
Checkout View - executes atomic 20-step checkout workflow via CheckoutService.
"""
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
