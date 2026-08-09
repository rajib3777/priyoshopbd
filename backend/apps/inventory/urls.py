from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryListView.as_view(), name='inventory_list'),
    path('<int:inventory_id>/adjust/', views.InventoryAdjustView.as_view(), name='inventory_adjust'),
    path('transactions/', views.InventoryTransactionListView.as_view(), name='inventory_transactions'),
]
