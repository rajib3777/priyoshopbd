from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product_list'),
    path('search-suggestions/', views.SearchSuggestionView.as_view(), name='search_suggestions'),
    path('bundles/', views.ProductBundleListView.as_view(), name='product_bundles'),
    path('admin/products/', views.AdminProductListCreateView.as_view(), name='admin_product_list'),
    path('admin/products/<int:id>/', views.AdminProductDetailView.as_view(), name='admin_product_detail'),
    path('admin/product-images/', views.AdminProductImageUploadView.as_view(), name='admin_product_images'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
]
