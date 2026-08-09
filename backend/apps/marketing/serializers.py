from rest_framework import serializers
from apps.marketing.models import MarketingCampaign, CampaignRecipient, CampaignEvent


class MarketingCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingCampaign
        fields = '__all__'
