from django.urls import path
from . import views

urlpatterns = [
    path('', views.PromotionListView.as_view(), name='promotion_list'),
    path('<int:id>/', views.PromotionDetailView.as_view(), name='promotion_detail'),

    # Deals & Offers Cards
    path('deal-cards/', views.DealOfferCardListView.as_view(), name='deal_card_list'),
    path('deal-cards/<int:id>/', views.DealOfferCardDetailView.as_view(), name='deal_card_detail'),
]
