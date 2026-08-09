"""
Cart views - persistent cart for guest & authenticated customers
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.cart.models import Cart, CartItem, AbandonedCart
from apps.cart.serializers import CartSerializer, CartItemSerializer, AbandonedCartSerializer
from apps.products.models import Product, ProductVariant
from core.permissions import IsAdminUser


class CartDetailView(APIView):
    """Retrieve or initialize customer cart."""
    permission_classes = [permissions.AllowAny]

    def get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart

        session_key = request.headers.get('X-Session-Key') or request.query_params.get('session_key')
        if not session_key:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key

        cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart

    def get(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(APIView):
    """Add product/variant to cart."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        cart_view = CartDetailView()
        cart = cart_view.get_cart(request)

        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, is_active=True, status='active')
        except Product.DoesNotExist:
            return Response({'error': 'Product not available'}, status=status.HTTP_400_BAD_REQUEST)

        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id, product=product, is_active=True)
            except ProductVariant.DoesNotExist:
                return Response({'error': 'Variant not available'}, status=status.HTTP_400_BAD_REQUEST)

        # Stock check
        target_inv = variant.inventory if (variant and hasattr(variant, 'inventory')) else getattr(product, 'inventory', None)
        if target_inv and product.track_inventory:
            current_cart_qty = 0
            existing_item = CartItem.objects.filter(cart=cart, product=product, variant=variant).first()
            if existing_item:
                current_cart_qty = existing_item.quantity

            if target_inv.available_quantity < (current_cart_qty + quantity):
                return Response({
                    'error': f'Only {target_inv.available_quantity} items available in stock'
                }, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, variant=variant,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        # Update cart metrics
        product.cart_add_count += 1
        product.save(update_fields=['cart_add_count'])

        return Response(CartSerializer(cart).data)


class CartItemUpdateView(APIView):
    """Update cart item quantity or remove if qty <= 0."""
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        cart_view = CartDetailView()
        cart = cart_view.get_cart(request)
        quantity = int(request.data.get('quantity', 1))

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not in cart'}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart_view = CartDetailView()
        cart = cart_view.get_cart(request)
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart).data)


class AdminAbandonedCartListView(generics.ListAPIView):
    """Admin view for abandoned cart analytics."""
    serializer_class = AbandonedCartSerializer
    permission_classes = [IsAdminUser]
    queryset = AbandonedCart.objects.all().order_by('-abandoned_at')
    filterset_fields = ['recovered', 'campaign_sent']
