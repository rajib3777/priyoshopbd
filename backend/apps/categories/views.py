"""
Category views - Storefront public & Admin CRUD
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from core.permissions import IsAdminUser, IsAdminOrReadOnly
from .models import Category, SubCategory
from .serializers import CategorySerializer, SubCategorySerializer


class CategoryListView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['is_active', 'show_in_menu']
    search_fields = ['name', 'description']
    ordering_fields = ['sort_order', 'name']

    def get_queryset(self):
        qs = Category.objects.prefetch_related('subcategories').order_by('sort_order', 'id')
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.get_queryset()
        lookup_val = self.kwargs.get(self.lookup_field)
        if str(lookup_val).isdigit():
            return generics.get_object_or_404(queryset, id=int(lookup_val))
        return generics.get_object_or_404(queryset, slug=lookup_val)

    def get_queryset(self):
        return Category.objects.prefetch_related('subcategories').all()


class SubCategoryListView(generics.ListCreateAPIView):
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['category', 'is_active', 'show_in_menu']
    search_fields = ['name', 'description']

    def get_queryset(self):
        qs = SubCategory.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class SubCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.get_queryset()
        lookup_val = self.kwargs.get(self.lookup_field)
        if str(lookup_val).isdigit():
            return generics.get_object_or_404(queryset, id=int(lookup_val))
        return generics.get_object_or_404(queryset, slug=lookup_val)

    def get_queryset(self):
        return SubCategory.objects.all()
