from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoryListView.as_view(), name='category_list'),
    path('subcategories/', views.SubCategoryListView.as_view(), name='subcategory_list'),
    path('subcategories/<slug:slug>/', views.SubCategoryDetailView.as_view(), name='subcategory_detail'),
    path('<slug:slug>/', views.CategoryDetailView.as_view(), name='category_detail'),
]
