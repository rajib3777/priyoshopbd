from django.urls import path
from . import views

urlpatterns = [
    path('', views.PromotionListView.as_view(), name='promotion_list'),
    path('<int:id>/', views.PromotionDetailView.as_view(), name='promotion_detail'),
]
