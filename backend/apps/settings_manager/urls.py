from django.urls import path
from . import views

urlpatterns = [
    path('public/', views.PublicSiteSettingView.as_view(), name='public_site_settings'),
    path('admin/site/', views.AdminSiteSettingUpdateView.as_view(), name='admin_site_settings'),
    path('admin/seo/', views.AdminSEOSettingUpdateView.as_view(), name='admin_seo_settings'),
]
