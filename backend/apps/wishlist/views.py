from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.wishlist.models import Wishlist, WishlistItem
from apps.wishlist.serializers import WishlistSerializer
from apps.products.models import Product


class CustomerWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(customer=request.user)
        return Response(WishlistSerializer(wishlist).data)

    def post(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(customer=request.user)
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        if created:
            product.wishlist_count += 1
            product.save(update_fields=['wishlist_count'])

        return Response(WishlistSerializer(wishlist).data)


class WishlistItemDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        wishlist, _ = Wishlist.objects.get_or_create(customer=request.user)
        WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).delete()
        return Response(WishlistSerializer(wishlist).data)
