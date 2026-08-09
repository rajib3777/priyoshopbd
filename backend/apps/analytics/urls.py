from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.AdminDashboardAnalyticsView.as_view(), name='admin_dashboard_analytics'),
]
