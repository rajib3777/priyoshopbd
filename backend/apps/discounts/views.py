from rest_framework import generics, permissions
from core.permissions import IsAdminUser
from apps.discounts.models import AccountDiscountConfig
from apps.discounts.serializers import AccountDiscountConfigSerializer


class AccountDiscountConfigView(generics.RetrieveUpdateAPIView):
    serializer_class = AccountDiscountConfigSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_object(self):
        obj, _ = AccountDiscountConfig.objects.get_or_create(id=1)
        return obj
