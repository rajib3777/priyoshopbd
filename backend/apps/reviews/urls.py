from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductReviewListView.as_view(), name='review_list'),
    path('admin/reviews/', views.AdminReviewListView.as_view(), name='admin_reviews_list'),
    path('admin/reviews/<int:pk>/moderate/', views.AdminReviewModerateView.as_view(), name='admin_review_moderate'),
]
