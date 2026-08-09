from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminOrReadOnly
from apps.homepage.models import HomepageSection, AnnouncementBar, HeroSlide
from apps.homepage.serializers import HomepageSectionSerializer, AnnouncementBarSerializer, HeroSlideSerializer


class HomepageDataView(APIView):
    """Public API returning all active homepage sections in sort order."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sections = HomepageSection.objects.filter(is_active=True).order_by('sort_order')\
                                         .prefetch_related('hero_slides', 'banners', 'testimonials', 'trust_features', 'video_items', 'featured_products')

        announcement = AnnouncementBar.objects.filter(is_active=True).first()

        return Response({
            'announcement': AnnouncementBarSerializer(announcement).data if announcement else None,
            'sections': HomepageSectionSerializer(sections, many=True).data
        })


class AdminHomepageSectionListCreateView(generics.ListCreateAPIView):
    """Admin Section Builder CRUD."""
    serializer_class = HomepageSectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = HomepageSection.objects.all().order_by('sort_order')


class AdminHomepageSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HomepageSectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'
    queryset = HomepageSection.objects.all()


class HeroSlideListView(generics.ListCreateAPIView):
    serializer_class = HeroSlideSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return HeroSlide.objects.all().order_by('sort_order', '-created_at')
        return HeroSlide.objects.filter(is_active=True).order_by('sort_order', '-created_at')


class HeroSlideDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HeroSlideSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'
    queryset = HeroSlide.objects.all()
