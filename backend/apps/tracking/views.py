from rest_framework import generics, permissions
from core.permissions import IsAdminUser
from apps.tracking.models import TrackingSetting
from apps.tracking.serializers import TrackingSettingSerializer


class PublicTrackingSettingView(generics.RetrieveAPIView):
    """Public API returning active GA4, GTM, Meta Pixel IDs for React to load dynamically."""
    serializer_class = TrackingSettingSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return TrackingSetting.get()


class AdminTrackingSettingUpdateView(generics.RetrieveUpdateAPIView):
    """Admin configuration for tracking IDs."""
    serializer_class = TrackingSettingSerializer
    permission_classes = [IsAdminUser]

    def get_object(self):
        return TrackingSetting.get()
