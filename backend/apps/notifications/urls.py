from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserNotificationListView.as_view(), name='notification_list'),
    path('<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='notification_read'),
]
