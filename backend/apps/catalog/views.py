from rest_framework import generics
from core.permissions import IsAdminOrReadOnly
from .models import Brand
from .serializers import BrandSerializer


class BrandListView(generics.ListCreateAPIView):
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['is_active', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['sort_order', 'name']

    def get_queryset(self):
        qs = Brand.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    queryset = Brand.objects.all()
