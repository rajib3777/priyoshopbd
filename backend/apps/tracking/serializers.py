from rest_framework import serializers
from apps.tracking.models import TrackingSetting


class TrackingSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingSetting
        fields = '__all__'
