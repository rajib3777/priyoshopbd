from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomepageDataView.as_view(), name='homepage_data'),
    path('admin/sections/', views.AdminHomepageSectionListCreateView.as_view(), name='admin_homepage_sections'),
    path('admin/sections/<int:id>/', views.AdminHomepageSectionDetailView.as_view(), name='admin_homepage_section_detail'),
]
