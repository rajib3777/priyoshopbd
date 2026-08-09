from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminOrReadOnly, IsAdminUser
from apps.settings_manager.models import SiteSetting, SEOSetting, FooterSection
from apps.settings_manager.serializers import SiteSettingSerializer, SEOSettingSerializer, FooterSectionSerializer


class PublicSiteSettingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        site_setting = SiteSetting.get()
        seo_setting = SEOSetting.get()
        footer_sections = FooterSection.objects.filter(is_active=True).prefetch_related('links')

        return Response({
            'site': SiteSettingSerializer(site_setting).data,
            'seo': SEOSettingSerializer(seo_setting).data,
            'footer': FooterSectionSerializer(footer_sections, many=True).data
        })


class AdminSiteSettingUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = SiteSettingSerializer
    permission_classes = [IsAdminUser]

    def get_object(self):
        return SiteSetting.get()


class AdminSEOSettingUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = SEOSettingSerializer
    permission_classes = [IsAdminUser]

    def get_object(self):
        return SEOSetting.get()
