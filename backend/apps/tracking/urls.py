from django.urls import path
from . import views

urlpatterns = [
    path('public/', views.PublicTrackingSettingView.as_view(), name='public_tracking'),
    path('admin/', views.AdminTrackingSettingUpdateView.as_view(), name='admin_tracking'),
]
