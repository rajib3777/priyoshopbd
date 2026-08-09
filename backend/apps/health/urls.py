from django.urls import path
from . import views

urlpatterns = [
    path('system/', views.SystemHealthView.as_view(), name='system_health'),
]
