from rest_framework import generics
from core.permissions import IsAdminUser
from apps.marketing.models import MarketingCampaign
from apps.marketing.serializers import MarketingCampaignSerializer


class MarketingCampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = MarketingCampaignSerializer
    permission_classes = [IsAdminUser]
    queryset = MarketingCampaign.objects.all().order_by('-created_at')


class MarketingCampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MarketingCampaignSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
    queryset = MarketingCampaign.objects.all()
