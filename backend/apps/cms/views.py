from rest_framework import generics
from core.permissions import IsAdminOrReadOnly
from apps.cms.models import CMSPage, Menu
from apps.cms.serializers import CMSPageSerializer, MenuSerializer


class CMSPageListView(generics.ListCreateAPIView):
    serializer_class = CMSPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['title', 'content']

    def get_queryset(self):
        qs = CMSPage.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        return qs


class CMSPageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CMSPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        return CMSPage.objects.all()


class MenuListView(generics.ListCreateAPIView):
    serializer_class = MenuSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Menu.objects.filter(is_active=True)


class MenuDetailView(generics.RetrieveAPIView):
    serializer_class = MenuSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    queryset = Menu.objects.filter(is_active=True)
