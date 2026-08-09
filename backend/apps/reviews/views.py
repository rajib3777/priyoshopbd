from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminUser
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer
from apps.orders.models import OrderItem


class ProductReviewListView(generics.ListCreateAPIView):
    """Customer list & submit product review."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        qs = Review.objects.filter(status='approved').select_related('customer', 'product').order_by('-created_at')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs

    def perform_create(self, serializer):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = self.request.user if self.request.user.is_authenticated else User.objects.filter(is_staff=True).first()
        product_id = self.request.data.get('product')

        has_purchased = False
        if self.request.user.is_authenticated and product_id:
            has_purchased = OrderItem.objects.filter(
                order__customer=self.request.user,
                order__status='delivered',
                product_id=product_id
            ).exists()

        serializer.save(
            customer=user,
            is_verified_purchase=has_purchased,
            status='approved'
        )


class AdminReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminUser]
    queryset = Review.objects.all().order_by('-created_at')
    filterset_fields = ['status', 'rating']


class AdminReviewModerateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            review = Review.objects.get(id=pk)
            review.status = request.data.get('status', 'approved')
            review.moderation_note = request.data.get('note', '')
            review.moderated_by = request.user
            review.save()
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
