from django.urls import path
from . import views

urlpatterns = [
    path('pages/', views.CMSPageListView.as_view(), name='cms_page_list'),
    path('pages/<slug:slug>/', views.CMSPageDetailView.as_view(), name='cms_page_detail'),
    path('menus/', views.MenuListView.as_view(), name='menu_list'),
    path('menus/<slug:slug>/', views.MenuDetailView.as_view(), name='menu_detail'),
]
