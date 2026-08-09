from rest_framework import generics
from core.permissions import IsAdminUser
from core.pagination import LargeResultsPagination
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """Admin: Browse audit logs with filters."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]
    pagination_class = LargeResultsPagination
    filterset_fields = ['action', 'entity', 'user']
    search_fields = ['entity', 'entity_id', 'description', 'user__email']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return AuditLog.objects.select_related('user').all()
