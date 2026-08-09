"""
Audit log middleware — records important admin actions automatically.
"""
import json
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('apps.audit')

# Paths to audit (write operations on admin API)
AUDITED_METHODS = {'POST', 'PUT', 'PATCH', 'DELETE'}
AUDITED_PATH_PREFIXES = ['/api/v1/admin/', '/api/v1/auth/admin/']
EXCLUDED_PATHS = ['/api/v1/admin/audit/']


class AuditLogMiddleware(MiddlewareMixin):
    """
    Records admin write operations to the AuditLog model.
    Only fires for authenticated staff users on write endpoints.
    """

    def process_response(self, request, response):
        try:
            if not self._should_audit(request, response):
                return response

            user = getattr(request, 'user', None)
            if not user or not user.is_authenticated or not user.is_staff:
                return response

            # Lazy import to avoid circular
            from apps.audit.models import AuditLog
            from core.utils import get_client_ip

            path = request.path
            method = request.method
            action = self._get_action(method)
            entity = self._extract_entity(path)
            entity_id = self._extract_entity_id(path)

            # Try to get request body (only for POST/PUT/PATCH)
            request_data = {}
            if method in {'POST', 'PUT', 'PATCH'}:
                try:
                    if hasattr(request, '_body') and request._body:
                        request_data = json.loads(request._body)
                        # Strip sensitive fields
                        for field in ['password', 'confirm_password', 'token', 'secret']:
                            request_data.pop(field, None)
                except Exception:
                    pass

            AuditLog.objects.create(
                user=user,
                action=action,
                entity=entity,
                entity_id=str(entity_id) if entity_id else '',
                description=f'{method} {path}',
                ip_address=get_client_ip(request),
                status_code=response.status_code,
                request_data=request_data,
            )
        except Exception as e:
            logger.error(f'AuditLog middleware error: {e}')

        return response

    def _should_audit(self, request, response):
        if request.method not in AUDITED_METHODS:
            return False
        path = request.path
        for excluded in EXCLUDED_PATHS:
            if path.startswith(excluded):
                return False
        for prefix in AUDITED_PATH_PREFIXES:
            if path.startswith(prefix):
                return True
        return False

    def _get_action(self, method):
        return {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }.get(method, 'unknown')

    def _extract_entity(self, path):
        parts = [p for p in path.strip('/').split('/') if p]
        # /api/v1/admin/products/123/ → products
        for i, part in enumerate(parts):
            if part == 'admin' and i + 1 < len(parts):
                return parts[i + 1]
        return 'unknown'

    def _extract_entity_id(self, path):
        parts = [p for p in path.strip('/').split('/') if p]
        for part in reversed(parts):
            if part.isdigit():
                return part
        return None
