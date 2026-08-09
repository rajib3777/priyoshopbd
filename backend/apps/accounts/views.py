"""
Accounts views — Authentication, Registration, Profile, Password management
"""
import secrets
import logging
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter
from core.permissions import IsAdminUser
from core.utils import get_client_ip
from .models import PasswordResetToken, AdminRole, RolePermission
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AdminUserSerializer,
    AdminRoleSerializer,
    RolePermissionSerializer,
)

User = get_user_model()
logger = logging.getLogger('apps.accounts')


class RegisterView(generics.CreateAPIView):
    """Customer registration."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Auth'])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Auto-generate tokens for immediate login
        refresh = RefreshToken.for_user(user)
        logger.info(f'New customer registered: {user.email}')

        return Response({
            'success': True,
            'message': 'Registration successful.',
            'data': {
                'user': UserProfileSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """JWT login returning user data + tokens."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Auth'])
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Track last login IP
            email = request.data.get('email', '').lower()
            try:
                user = User.objects.get(email=email)
                user.last_login_ip = get_client_ip(request)
                user.save(update_fields=['last_login_ip'])
            except User.DoesNotExist:
                pass
            logger.info(f'User logged in: {email}')
        return response


class LogoutView(APIView):
    """Blacklist refresh token on logout."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Auth'])
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f'User logged out: {request.user.email}')
            return Response({'success': True, 'message': 'Logged out successfully.'})
        except Exception:
            return Response({'success': True, 'message': 'Logged out.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update customer profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Auth'])
    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({'success': True, 'data': response.data})


class ChangePasswordView(APIView):
    """Change authenticated user's password."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Auth'])
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        logger.info(f'Password changed for: {request.user.email}')
        return Response({'success': True, 'message': 'Password changed successfully.'})


class PasswordResetRequestView(APIView):
    """Send password reset token via email."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Auth'])
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email, is_active=True)
            # Invalidate old tokens
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            # Create new token
            token_value = secrets.token_urlsafe(32)
            PasswordResetToken.objects.create(
                user=user,
                token=token_value,
                expires_at=timezone.now() + timedelta(hours=1),
                ip_address=get_client_ip(request),
            )
            # Send email
            reset_url = f'{settings.FRONTEND_URL}/reset-password?token={token_value}'
            send_mail(
                subject='Reset Your PriyoShop Password',
                message=f'Click the link to reset your password: {reset_url}\n\nThis link expires in 1 hour.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            logger.info(f'Password reset requested for: {email}')
        except User.DoesNotExist:
            pass  # Don't reveal if email exists

        # Always return 200 to prevent email enumeration
        return Response({
            'success': True,
            'message': 'If this email is registered, you will receive a reset link shortly.',
        })


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Auth'])
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_token = serializer.validated_data['reset_token']
        user = reset_token.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        reset_token.used = True
        reset_token.save()
        logger.info(f'Password reset completed for: {user.email}')
        return Response({'success': True, 'message': 'Password reset successful. You can now login.'})


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """Admin: List all users."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['is_active', 'is_staff', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['date_joined', 'email', 'last_login']
    ordering = ['-date_joined']

    @extend_schema(tags=['Admin'])
    def get_queryset(self):
        return User.objects.select_related('admin_role').all()


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """Admin: Get/update user."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    @extend_schema(tags=['Admin'])
    def get_queryset(self):
        return User.objects.select_related('admin_role').all()


class AdminRoleListCreateView(generics.ListCreateAPIView):
    """Admin: List and create roles."""
    serializer_class = AdminRoleSerializer
    permission_classes = [IsAdminUser]
    queryset = AdminRole.objects.prefetch_related('permissions').all()


class AdminRoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get/update/delete role."""
    serializer_class = AdminRoleSerializer
    permission_classes = [IsAdminUser]
    queryset = AdminRole.objects.prefetch_related('permissions').all()


class RolePermissionListView(generics.ListAPIView):
    """Admin: List all available permissions."""
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdminUser]
    queryset = RolePermission.objects.all()
