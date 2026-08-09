from django.urls import path
from . import views

urlpatterns = [
    path('config/', views.AccountDiscountConfigView.as_view(), name='account_discount_config'),
]
